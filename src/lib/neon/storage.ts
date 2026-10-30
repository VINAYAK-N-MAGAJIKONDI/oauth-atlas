import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

const BUCKET_NAME = "assets";

let s3Client: S3Client | null = null;

export function getS3Client(): S3Client | null {
  if (s3Client) return s3Client;

  const endpoint = process.env.AWS_ENDPOINT_URL_S3;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || "us-east-1";

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    return null;
  }

  s3Client = new S3Client({
    endpoint,
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true, // Required for Neon Object Storage
  });

  return s3Client;
}

export async function uploadAsset(
  key: string,
  content: string | Buffer,
  contentType: string = "text/plain"
): Promise<{ success: boolean; key: string; error?: string }> {
  const client = getS3Client();
  if (!client) {
    return { success: false, key, error: "Neon Object Storage credentials not configured." };
  }

  try {
    const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);
    await client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );
    return { success: true, key };
  } catch (err: unknown) {
    return { success: false, key, error: (err as Error).message };
  }
}

export async function getAsset(
  key: string
): Promise<{ success: boolean; text?: string; error?: string }> {
  const client = getS3Client();
  if (!client) {
    return { success: false, error: "Neon Object Storage credentials not configured." };
  }

  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    );

    const stream = response.Body;
    if (!stream) {
      return { success: false, error: "Empty response body." };
    }

    const text = await stream.transformToString();
    return { success: true, text };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message };
  }
}

export async function listAssets(): Promise<{ success: boolean; keys?: string[]; error?: string }> {
  const client = getS3Client();
  if (!client) {
    return { success: false, error: "Neon Object Storage credentials not configured." };
  }

  try {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        MaxKeys: 20,
      })
    );

    const keys = response.Contents?.map((obj) => obj.Key || "") || [];
    return { success: true, keys };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message };
  }
}
