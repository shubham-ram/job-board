import { randomUUID } from "crypto";

function requestId(req, res, next) {
  const id = randomUUID();

  req.id = id;
  res.setHeader("X-Request-Id", req.id);
  next();
}

export default requestId;
