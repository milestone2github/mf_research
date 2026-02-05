export const getJWTPrivateKey = () => {
    const JWT_PRIVATE_KEY = process.env.INTERNAL_JWT_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!JWT_PRIVATE_KEY?.includes("BEGIN PRIVATE KEY")) {
      throw new Error("JWT_PRIVATE_KEY is missing or not a PEM private key");
    }

    // debug
    console.log('JWT_PRIVATE_KEY starts with:', JWT_PRIVATE_KEY.slice(0, 30));
    console.log('JWT_PRIVATE_KEY length:', JWT_PRIVATE_KEY.length);

    return JWT_PRIVATE_KEY;
}