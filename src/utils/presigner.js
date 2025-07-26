import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class Presigner {
    async presign(mimeType, fileSize, sha256, userId) {

        if (fileSize > 10 * 1024 * 1024)
            return { statusCode: 400, body: "Objeto demasiado grande" };

        if (!mimeType || !mimeType.startsWith("image/"))
            return { statusCode: 400, body: "Tipo de archivo no permitido" };

        const key = `uploads/${userId}/${uuid()}`;
        const s3Client = new S3Client({ region: "us-east-1" });
        const command = new PutObjectCommand({
            Bucket: process.env.BUCKET,
            Key: key,
            ContentType: mimeType,
            ContentLength: fileSize,
            ChecksumSHA256: sha256,
            BucketKeyEnabled: true
        });
        ;

        const presigned = await getSignedUrl(s3Client, command, {
            expiresIn: 300,
            signableHeaders: new Set(["content-type"]),
            unhoistableHeaders: new Set([
                "x-amz-checksum-sha256",
            ])
        });

        return { presignedUrl: presigned }

    }
}