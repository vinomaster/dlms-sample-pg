/**
 * Copyright (c) 2024 Discover Financial Services
 */
/// <reference types="react-scripts" />

declare module '@mui/material/styles' {
    interface Palette {
        main: {
            midnight: string;
            white: string;
            yellow: string;
            discoverOrange: string;
        };
        interface: {
            linkBlue: string;
            successGreen: string;
            alertRed: string;
            alertYellow: string;
        };
        uniqueProducts: {
            CSCGreen: string;
            ITPBlue: string;
        };
        others: {
            grey: string;
            focusLightBlue: string;
            borderStroke: string;
        };
        tints(color: string): Tints;
        disabled(color: string): string;
        tonalOffsets: TonalOffsets;
    }
    interface Tints {
        0.85: string;
        0.75: string;
        0.65: string;
        0.5: string;
        0.25: string;
        0.15: string;
        0.07: string;
        0.03: string;
    }
    interface TonalOffsets {
        hover: number;
        disabled: number;
        checked: number;
        label: number;
    }
    interface TypographyVariants
        extends Record<Variant, TypographyStyle>,
            FontStyle,
            TypographyUtils {
        fonts: {
            medium: string;
            semibold: string;
            bold: string;
        };
    }
}
