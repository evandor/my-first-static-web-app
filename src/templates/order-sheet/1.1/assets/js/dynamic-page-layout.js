const max_pages = 100;
let page_count = 0;
let totalPagesNo = 0
const pageTag = '.page';
const bodyTag = 'body';
const mainTag = 'main';
const footerTag = 'footer';
const currentPageNoClass = 'current-page-no';
const totalPagesNoClass = 'total-pages-no';
const pageBreakBeforeTag = 'page-break-before';
const pageBreakAfterTag = 'page-break-after';
const hidden = 'hidden';

function isPageContentOverflowing(page) {
    return page.scrollHeight - Math.ceil(page.clientHeight) > 0;
}

function selectPageContentInPage(page, pageContentNodeName) {
    const mainNodes = page.getElementsByTagName(pageContentNodeName)
    if (mainNodes.length !== 1) {
        throw new Error(`Could not find one node of type ${pageContentName} in the page!`);
    }
    return mainNodes[0];
}

function removeAllItemsFromPageContent(pageContent) {
    let pageContentItems = [];
    while (pageContent.children.length > 0) {
        let pageContentItem = pageContent.children.item(0);
        pageContent.removeChild(pageContentItem);
        pageContentItems.push(pageContentItem);
    }
    return pageContentItems;
}

function separatePageItemsFromPageLayout(page, pageContentName) {
    // find node in page layout, where the content of the page is located
    const pageContent = selectPageContentInPage(page, pageContentName)
    // extract all items of the page content 
    const pageContentItems = removeAllItemsFromPageContent(pageContent);
    // create a copy from the pure page layout (page without content)
    const pageLayout = page.cloneNode(true);
    page.parentNode.removeChild(page);
    return {
        pageContentItems: pageContentItems,
        pageLayout: pageLayout,
        pageContentNodeName: pageContentName,
    }
}

function getFirstElemByTagName(startNode, searchedChildName) {
    const foundNodes = startNode.getElementsByTagName(searchedChildName)
    if (foundNodes.length !== 1) {
        throw new Error(`Could not find node of type ${pageContentName} in ${startNode.name}`);
    }
    return foundNodes[0];
}

function insertPageAfter(body, previousPage, page) {
    if (previousPage == null) {
        body.prepend(page);
    } else {
        // insert page after previous page (same as to insert before the next sibling of the previousPage)
        body.insertBefore(page, previousPage.nextSibling);
    }
}

function addPage(page, previousPage) {
    const body = getFirstElemByTagName(document, bodyTag);
    insertPageAfter(body, previousPage, page);
    return page;
}

function createPageFromLayout(pageLayout) {
    return pageLayout.cloneNode(true);
}

function isManualPageBreakAttachedToItem(pageContentItem, pageBreakTag) {
    return pageContentItem.classList.contains(pageBreakTag);
}

function createPages(pageContentItems, pageLayout, previousPage) {
    page_count++;
    totalPagesNo++;

    // circuit-breaker: stop if webpage has so many items that more than max_pages are created 
    if (page_count > max_pages) {
        return;
    }

    const newPage = addPage(createPageFromLayout(pageLayout), previousPage);
    previousPage = newPage;
    const pageContent = selectPageContentInPage(newPage, mainTag)
    while (pageContentItems.length > 0) {
        const pageContentItem = pageContentItems.shift();

        // if there is a manual page break class attached to the item
        if (isManualPageBreakAttachedToItem(pageContentItem, pageBreakBeforeTag)) {
            // remove the page break
            pageContentItem.classList.remove(pageBreakBeforeTag);
            // restore pageContentItem, so it will be again top of the list
            pageContentItems.unshift(pageContentItem);
            pageContent.style.overflowY = hidden;
            createPages(pageContentItems, pageLayout, previousPage);
        } else {
            // insert item into page until page overflows
            pageContent.insertBefore(pageContentItem, null);
            if (isPageContentOverflowing(pageContent)) {
                // remove last item from page and push back item stack
                pageContent.removeChild(pageContentItem);
                pageContentItems.unshift(pageContentItem);
                pageContent.style.overflowY = hidden;

                // create pages from the rest of the content items
                createPages(pageContentItems, pageLayout, previousPage);
            } else {
                // if there is a manual page break class attached to the item
                if (isManualPageBreakAttachedToItem(pageContentItem, pageBreakAfterTag)) {
                    // remove the page break class
                    pageContentItem.classList.remove(pageBreakAfterTag);
                    pageContent.style.overflowY = hidden;

                    // force creation of new page
                    createPages(pageContentItems, pageLayout, previousPage);
                }
            }
        }
    }
}

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

function getElementsByClassNameRecursive(startNode, className) {
    let result = [];
    let child = startNode.children;

    function nodeRecursion(node) {
        for (let i = 0; i < node.length; i++) {
            let current = node[i];
            if (current.classList.contains(className)) {
                result.push(node[i]);
            }
            if (current.children.length) {
                nodeRecursion(current.children);
            }
        }
    }

    nodeRecursion(child);
    return result;
}

function setTextContentOfElemWithCssClass(startElement, cssClass, valueToSet) {
    const elementsWithGivenClass = getElementsByClassNameRecursive(startElement, cssClass);
    if (elementsWithGivenClass.length > 0) {
        elementsWithGivenClass[0].textContent = valueToSet;
    }
}

function replacePageNumbers(page, currentPageNo, totalPageNo) {
    // first search footer html element in page, should be only one in the page
    const footerNodes = page.getElementsByTagName(footerTag)
    // found footer node ...
    if (footerNodes.length > 0) {
        // start searching for span element with currentPageNo class elements and set currentPageNo
        setTextContentOfElemWithCssClass(footerNodes[0], currentPageNoClass, currentPageNo);
        // start searching for span element with totalPageNo class elements and set totalPageNo
        setTextContentOfElemWithCssClass(footerNodes[0], totalPagesNoClass, totalPageNo);
    }
}

/* 
 todo: dynamic pdf page layout
 - check that the height of each page content item is not larger than the height of the main-container.
 - eventually: factor out layout template from page content     
*/
document.addEventListener('DOMContentLoaded', function () {
    try {
        /* scale font size for elements that are tagged with ellipsis, if there the minimum fontsize is reached, show ellipsis */
        document.querySelectorAll("div.ellipsis")
            .forEach(el => scaleFontSize(el, 12, 5, "pt"));
        
        /* check if items in page fit into main section of page. Split page until all items fit in additional pages */
        let previousPage = null;
        document.querySelectorAll(pageTag) //".a4")
            .forEach(
                page => {
                    if (page.classList.contains("auto-layout")) {
                        // remove the auto-layout, so the page gets not layout multiple times
                        page.classList.remove("auto-layout");
                        // auto layout all pages that are marked with the class 'auto-layout'
                        const input = separatePageItemsFromPageLayout(page, mainTag)
                        createPages(input.pageContentItems, input.pageLayout, previousPage);
                    } else {
                        // count pages explicitly that are skipped (aka pages that are layouted manually and should 
                        // not be processed by this script)
                        previousPage = page;
                        page_count++;
                        totalPagesNo++;
                    }
                }
            );
        /* replace currentPageNo and totalPageNo placeholders */
        document.querySelectorAll(pageTag) //".a4")
            .forEach((page, currentPageNo) => replacePageNumbers(page, currentPageNo + 1, totalPagesNo));
    } catch (e) {
        const stacktrace = (e.stack) ? e.stack : e.toString();
        alert(`${stacktrace}`);
    }
}, false);