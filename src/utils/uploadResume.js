import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";
import { RESUME_FOLDER, RESUME_RESOURCE_TYPE } from "../constant.js";

function uploadResume(file) {
  return new Promise((res, rej) => {
    const config = {
      resource_type: RESUME_RESOURCE_TYPE,
      folder: RESUME_FOLDER,
    };

    const cb = (err, result) => {
      if (err) {
        rej(err);
      }
      res(result);
    };

    const stream = cloudinary.uploader.upload_stream(config, cb);

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
}

export default uploadResume;
