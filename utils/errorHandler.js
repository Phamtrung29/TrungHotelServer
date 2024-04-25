const errorHandler = (err, res, req) => {
  // let required = false;
  // let message = "";
  // let field = null;
  // let status = 500;
  // if (err.name === "ValidationError") {
  //   message = "invalidError";
  //   status = 400;
  //   if (err.details) {
  //     const detail = err.details[0];
  //     if (detail && detail.type) {
  //       if (detail.type.includes("required")) {
  //         message = "requiredError";
  //       }
  //     }
  //     if (detail && detail.path && detail.path.length > 0) {
  //       field = detail.path[0];
  //     }
  //   } else if (err.errors) {
  //     for (field in err.errors) {
  //       if (err.errors[field].kind == "required") {
  //         required = true;
  //       }
  //     }
  //     message = required ? "requiredError" : "invalidError";
  //   }
  // } else if (
  //   (err.name === "MongoError" || err.name === "MongoServerError") &&
  //   err.code === 11000
  // ) {
  //   message = "duplicateError";
  //   status = 409;
  // } else if (err.name === "SyntaxError") {
  //   message = "syntaxError";
  //   status = 400;
  // } else {
  //   message = "serverError";
  // }
  // return { status, message, field };

    const statusCode = res?.statusCode === 200 ? 500 : res.statusCode;
    return res.status(statusCode).json({
      success: false, 
      mes: err?.message,
    });
};

module.exports = errorHandler;
