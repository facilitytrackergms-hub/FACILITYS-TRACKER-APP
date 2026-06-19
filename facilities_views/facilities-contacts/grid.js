<div style="
    margin-bottom:14px;
    text-align:center;
">

    <div style="
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:8px;
        margin-bottom:6px;
        font-size:22px;
        font-weight:bold;
        color:#111827;
    ">
        <div>${escapeHtml(contact.name || '')}</div>
        <div>${escapeHtml(contact.role || '')}</div>
    </div>

    <div style="
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:8px;
        margin-bottom:6px;
        font-size:16px;
        font-weight:bold;
    ">
        <div>
            ${contact.phone ? `<button id="btn-contact-phone-options" class="contact-detail-link">${escapeHtml(contact.phone)}</button>` : ''}
        </div>

        <div>
            ${contact.email ? `<a class="contact-detail-link" href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a>` : ''}
        </div>
    </div>

    <div style="
        font-size:16px;
        margin-bottom:4px;
    ">
        ${escapeHtml(contact.address || '')}
    </div>

    <div style="
        font-size:16px;
        color:#444;
    ">
        ${escapeHtml(contact.notes || '')}
    </div>

</div>
