export const requireCredentials = (req,res,next) => {
  const cookieName = process.env.SESSION_COOKIE_NAME || "sessionId";
  const cookies = req.headers.cookie || "";

  const hasSessionCookie = cookies
    .split(";")
    .some((cookie) => {
      const [name, ...value] = cookie.trim().split("=");
      return name === cookieName && value.join("=").length > 0;
    })

  const hasBearerToken =
    /^Bearer\s+\S+$/i.test(req.headers.authorization || "");

  if (!hasSessionCookie && !hasBearerToken) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    })
  }

  next()
}