package com.campushub.util;

/**
 * Strips HTML tags from user-supplied text to prevent stored-XSS.
 *
 * Uses a simple regex for basic tag stripping (no external deps).
 * If jsoup is already on the classpath it can be swapped in trivially.
 */
public final class HtmlSanitizer {

    /** Matches any HTML/XML tag including self-closing ones. */
    private static final java.util.regex.Pattern HTML_TAG =
            java.util.regex.Pattern.compile("<[^>]*>", java.util.regex.Pattern.DOTALL);

    /** Matches common HTML entities. */
    private static final java.util.regex.Pattern HTML_ENTITY =
            java.util.regex.Pattern.compile("&[a-zA-Z0-9#]{1,10};");

    private HtmlSanitizer() {}

    /**
     * Strip all HTML tags and decode/remove common entities.
     * Returns {@code null} safely if input is {@code null}.
     */
    public static String strip(String input) {
        if (input == null) return null;
        String noTags = HTML_TAG.matcher(input).replaceAll("");
        // Collapse HTML entities like &lt; &amp; &#39; etc.
        String noEntities = HTML_ENTITY.matcher(noTags).replaceAll("");
        return noEntities.trim();
    }

    /**
     * Convenience: strip and then truncate to {@code maxLength} characters.
     */
    public static String stripAndTruncate(String input, int maxLength) {
        String clean = strip(input);
        if (clean == null) return null;
        return clean.length() > maxLength ? clean.substring(0, maxLength) : clean;
    }
}


