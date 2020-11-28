class RSAStaticUnit {
    private static public_key = "-----BEGIN PUBLIC KEY-----\n" +
        "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCmBCWNtxeofYkH1e9GXKgszj4E\n" +
        "cJojNvlesPDM201q+fiVf2X4SWPNjdduRS19dq9Koq4Dz0ul3xV6E3ydCHl88qSa\n" +
        "94fDGZa24UueYVYE0ytYuJcOu164GlIfu48Rir0NXA2BfoQxMcSpMmLJt20rSg+E\n" +
        "oP24zaj3ti78b1zJEwIDAQAB\n" +
        "-----END PUBLIC KEY-----";

    public static encrypted(data: string): string {
        // @js-ignore
        const jse = new JSEncrypt();
        jse.setPublicKey(RSAStaticUnit.public_key);
        return jse.encrypt(data);
    }
}