// DSN 2FA TOTP Engine Helper
function generateTOTP(secretKey) {
    try {
        let cleanSecret = secretKey.replace(/\s+/g, '');
        let totp = new OTPAuth.TOTP({
            issuer: "DSN OS",
            label: "User",
            algorithm: "SHA1",
            digits: 6,
            period: 30,
            secret: OTPAuth.Secret.fromBase32(cleanSecret)
        });
        return totp.generate();
    } catch (e) {
        console.error("TOTP Generation Error:", e);
        return "------";
    }
}
