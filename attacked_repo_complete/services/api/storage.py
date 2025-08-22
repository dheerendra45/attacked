import boto3
from botocore.client import Config
from .config import settings

session = boto3.session.Session()
s3 = session.client(
    's3',
    endpoint_url=f"http://{settings.minio_endpoint}",
    aws_access_key_id=settings.minio_access_key,
    aws_secret_access_key=settings.minio_secret_key,
    config=Config(signature_version='s3v4'),
    region_name='us-east-1')

BUCKET = settings.minio_bucket

def put_object(key: str, data: bytes, content_type: str):
    s3.put_object(Bucket=BUCKET, Key=key, Body=data, ContentType=content_type)
    return f"s3://{BUCKET}/{key}"

def put_file(key: str, file_path: str):
    s3.upload_file(file_path, BUCKET, key)
    return f"s3://{BUCKET}/{key}"
