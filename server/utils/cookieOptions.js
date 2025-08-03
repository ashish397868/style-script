const cookieOptions = {
  httpOnly: true, // Browser ke JavaScript se cookie accessible nahi hoti,Sirf server hi read/write kar sakta hai. , Protects from XSS attacks.
  secure: false, //  should be true in production because true means Cookie only sent on HTTPS. and secure: false means => Cookie sent on both HTTP and HTTPS.
  sameSite: "lax", //Prevents CSRF attacks. if "strict"	Cookie only sent from same domain.
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days Defines how long the cookie will persist in the browser. Measured in milliseconds.
};

module.exports = {cookieOptions};