/*================================================================
SYSTEM: Facility Tracker Modular View System
PURPOSE: Material Amazon search helper
LOCATION: /facilities_views/materials/material-amazon.js
VERSION: v2026_06_21_material_amazon_search_fix
UPDATED: 2026-06-21
================================================================*/

export function openAmazonMaterialSearch(materialName = '') {
    const searchText = String(materialName || '').trim();

    if (!searchText) {
        return {
            success: false,
            message: 'Material name is required before searching Amazon.'
        };
    }

    const amazonSearchUrl = `https://www.amazon.com/s?field-keywords=${encodeURIComponent(searchText)}&ref=nb_sb_noss`;

    window.open(amazonSearchUrl, '_blank', 'noopener,noreferrer');

    return {
        success: true,
        message: 'Amazon search opened.'
    };
}
