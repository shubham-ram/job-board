import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";
import { RESUME_FOLDER, RESUME_RESOURCE_TYPE } from "../constant.js";

function pipeToCloudinary(file, config) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(config, (err, result) =>
      err ? reject(err) : resolve(result)
    );
    streamifier.createReadStream(file.buffer).pipe(stream);
  });
}

function uploadResume(file) {
  return pipeToCloudinary(file, {
    resource_type: RESUME_RESOURCE_TYPE,
    folder: RESUME_FOLDER,
  });
}

function replaceResume(file, existingPublicId) {
  return pipeToCloudinary(file, {
    resource_type: RESUME_RESOURCE_TYPE,
    public_id: existingPublicId,
    overwrite: true,
    invalidate: true,
  });
}

export { uploadResume, replaceResume };
