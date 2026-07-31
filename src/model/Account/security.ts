export default class Security {
    /**
     * Converts a byte array into a hex string.
     */
    #toHex(bytes: Uint8Array): string {
        return Array.from(bytes)
            .map((byte) => byte.toString(16).padStart(2, "0"))
            .join("");
    }

    /**
     * Converts a hex string back into a byte array.
     */
    #fromHex(hex: string): Uint8Array<ArrayBuffer> {
        if (hex.length % 2 !== 0) {
            throw new Error("Invalid hexadecimal value");
        }

        const bytes = new Uint8Array(hex.length / 2);

        for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] =
                parseInt(hex.substring(i, i + 2), 16);
        }

        return bytes;
    }

    /**
     * Creates a PBKDF2 hash using a supplied salt.
     */
    async #deriveHash(
        password: string,
        salt: Uint8Array<ArrayBuffer>
    ): Promise<Uint8Array<ArrayBuffer>> {
        const encoder = new TextEncoder();

        const keyMaterial = await crypto.subtle.importKey(
            "raw",
            encoder.encode(password),
            { name: "PBKDF2" },
            false,
            ["deriveBits"]
        );

        const derivedBits = await crypto.subtle.deriveBits(
            {
                name: "PBKDF2",
                salt,
                iterations: 10_000,
                hash: "SHA-256"
            },
            keyMaterial,
            256
        );

        return new Uint8Array(derivedBits);
    }
    /**
     * Creates a new salt and hashes a password for account creation.
     */
    async hashPassword(password: string): Promise<string> {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const hash = await this.#deriveHash(password, salt);

        const saltHex = this.#toHex(salt);
        const hashHex = this.#toHex(hash);

        return `${saltHex}:${hashHex}`;
    }

    /**
     * Checks an entered password using the salt stored in the database.
     */
    async verifyPassword(
        enteredPassword: string,
        storedPassword: string
    ): Promise<boolean> {
        const passwordParts = storedPassword.split(":");

        if (passwordParts.length !== 2) {
            return false;
        }

        const saltHex = passwordParts[0];
        const storedHashHex = passwordParts[1];

        const salt = this.#fromHex(saltHex);

        const enteredHash =
            await this.#deriveHash(enteredPassword, salt);

        const enteredHashHex = this.#toHex(enteredHash);

        return enteredHashHex === storedHashHex;
    }
}