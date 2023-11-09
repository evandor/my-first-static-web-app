function scaleFontSize(element, defaultStartFontSize, minFontSize, fontSizeUnit) {
    console.log("element", element);
    console.log("defaultStartFontSize", defaultStartFontSize);
    console.log("minFontSize", minFontSize);
    console.log("fontSizeUnit", fontSizeUnit);
    console.log("original fontsize", element.style.fontSize);
    console.log("original fontsize type", element.style.fontSize.type);

    // We only want to scale down long text, so first we reset font-size to a default font size
    let newFontSize = defaultStartFontSize;
    element.style.fontSize = `${newFontSize}${fontSizeUnit}`;
    console.log("default fontsize", element.style.fontSize);

    // We check the content width once more and if it still doesn't fit then we reduce the font size by 1px.
    while ((element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight) && newFontSize >= minFontSize) {
        newFontSize -= 1;
        element.style.fontSize = `${newFontSize}${fontSizeUnit}`;
        console.log("fontsize", element.style.fontSize);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    try {
        document.querySelectorAll("div.ellipsis")
            .forEach(el => scaleFontSize(el, 12, 5, "pt"));
    } catch (e) {
        const stacktrace = (e.stack) ? e.stack : e.toString();
        alert(`${stacktrace}`);
    }
}, false);
