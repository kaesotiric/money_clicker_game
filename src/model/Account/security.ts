
/**
 * Handles password hashing and password verification
 */
export default class Security {

    /**
     * Converts a byte array into a hex string.
     */
    #toHex(bytes: Uint8Array): string {
        // Turns the byte array into a normal array so map can process each byte
        return Array.from(bytes)
            .map((byte) => byte.toString(16).padStart(2, "0"))  // Converts each byte into a hexadecimal value
            .join(""); // This will join all the converted bytes into one string
    }

    /**
     * Converts a hex string into a byte array
     *
     * @param hex The hex string being converted
     * @return The bytes created from hex string
     * @throws Error When the hex value is invalid
     */
    #fromHex(hex: string): Uint8Array<ArrayBuffer> {
        if (hex.length % 2 !== 0) {
            throw new Error("Invalid hexadecimal value");
        }

        const bytes = new Uint8Array(hex.length / 2); // Two hex characters represent one byte

        for (let i = 0; i < hex.length; i += 2) { // Moves through the string two characters at a time
            bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
        }

        return bytes;
    }

    /**
     * Creates a PBKDF2 hash using a supplied salt
     */
    async #deriveHash(
        password: string,
        salt: Uint8Array<ArrayBuffer>
    ): Promise<Uint8Array<ArrayBuffer>> {
        const encoder = new TextEncoder(); // TextEncoder changes the password into bytes that the crypto API can use

        const keyMaterial = await crypto.subtle.importKey(
            "raw",
            encoder.encode(password),
            { name: "PBKDF2" },
            false, // The imported key cannot be exported from the crypto API
            ["deriveBits"]
        );

        const derivedBits = await crypto.subtle.deriveBits(
            {
                name: "PBKDF2",
                salt, // Using this salt prevents identical passwords from always having identical hashes
                iterations: 10000, // Repeating the process makes password guessing slower
                hash: "SHA-256"
            },
            keyMaterial, 256
        );

        return new Uint8Array(derivedBits); // Convert the returned ArrayBuffer into a byte array
    }

    /**
     * Creates a random salt and hashes a password
     *
     * @param password The plain password being hashed
     * @return The salt and hash joined together for storage
     */
    public async hashPassword(password: string): Promise<string> {
        const salt = crypto.getRandomValues(new Uint8Array(16));// This uses a different salt for every saved password
        const hash = await this.#deriveHash(password, salt); // Hash the password using the newly created salt

        const saltHex = this.#toHex(salt);
        const hashHex = this.#toHex(hash);

        return `${saltHex}:${hashHex}`; // Stores the salt and hash together so the salt is available during login
    }

    /**
     * Checks an entered password against a stored password
     *
     * @param enteredPassword The plain password entered by the user
     * @param storedPassword The stored salt and password hash
     * @return True when the password matches and false otherwise
     */
    public async verifyPassword(
        enteredPassword: string,
        storedPassword: string
    ): Promise<boolean> {
        let passwordMatches = false;

        const passwordParts = storedPassword.split(":");

        // A saved password should contain one salt and one hash
        if (passwordParts.length === 2) {
            const saltHex = passwordParts[0];
            const storedHashHex = passwordParts[1];

            const salt = this.#fromHex(saltHex);

            // Converts the entered password hash into the same format as the stored hash
            const enteredHash = await this.#deriveHash(enteredPassword, salt);

            // Hash the entered password using the same salt
            const enteredHashHex = this.#toHex(enteredHash);

            passwordMatches = enteredHashHex === storedHashHex;
        }

        return passwordMatches;
    }

}