/**
 * Verify reCAPTCHA v3 token
 */
export async function verifyRecaptcha(token: string): Promise<boolean> {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
        console.warn('RECAPTCHA_SECRET_KEY not configured, skipping verification');
        return true; // Allow in development without reCAPTCHA
    }

    try {
        const response = await fetch(
            'https://www.google.com/recaptcha/api/siteverify',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `secret=${secretKey}&response=${token}`,
            }
        );

        const data = await response.json();

        // reCAPTCHA v3 returns a score from 0.0 to 1.0
        // 0.0 is very likely a bot, 1.0 is very likely a human
        // Threshold of 0.5 is recommended by Google
        return data.success && data.score >= 0.5;
    } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        return false;
    }
}
