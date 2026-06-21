/*================================================================
SYSTEM: Facility Tracker Modular View System
PURPOSE: Material Amazon search helper
LOCATION: /facilities_views/materials/material-amazon.js
VERSION: v2026_06_21_material_amazon_open_blank
UPDATED: 2026-06-21
LINES: 21
================================================================*/

export function openAmazonMaterialSearch() {
    const amazonUrl = 'https://www.amazon.com/';

    window.open(amazonUrl, '_blank', 'noopener,noreferrer');

    return {
        success: true,
        message: 'Amazon opened.'
    };
}
