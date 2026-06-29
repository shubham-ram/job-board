import AppError from "../utils/AppError";

function authorize(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.account.role)) {
      throw new AppError(
        `Role '${req.account.role}' is not authorized to access this resource`,
        403
      );
    }

    next();
  };
}

export default authorize;
