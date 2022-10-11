$(function () {
    var $header = $('#header');
    var $main = $('#panelMain');
    var $uv = $('uv');

    init();
});

var jsonRequestObj;
var isFullScreen = true;

$(document).bind('uv.onToggleFullScreen', function (event, obj) {
    isFullScreen = obj.isFullScreen;

    var fullScreen = 'fullscreen';
    var hideOverflow = 'hideOverflow';
    var hidden = 'hidden';

    if (isFullScreen) {
        $('.xFullscreen').addClass(fullScreen);
    } else {
        $('.xFullscreen').removeClass(fullScreen);
    }

    if (isFullScreen) {
        $('.xHideOverflow').addClass(hideOverflow);
    } else {
        $('.xHideOverflow').removeClass(hideOverflow);
    }

    if (isFullScreen) {
        $('.xHide').addClass(hidden);
    } else {
        $('.xHide').removeClass(hidden);
    }

    resize();
});


$(document).bind('seadragonExtension.onPrint', function (event, obj) {
    console.log('seadragonExtension.onPrint', obj);
    event.preventDefault();
});

$(document).bind('seadragonExtension.onMultiSelectionMade', function (event, obj) {
    console.log('seadragonExtension.onMultiSelectionMade', obj);
    submitJSONPrint(obj);
});

$(document).bind('uv.onFeedback', function (event, obj) {
    console.log('uv.onFeedback', obj);
    submitJSONFeedback(obj);
});

function init() {
    checkTestIds();
}

function submitJSONPrint(data) {
    var dataJSON = JSON.stringify(data);
    $('#modalForm').attr('action', "https://" + downloadsite);
    $('#EventArgs').val(dataJSON);
    $('#modalForm').submit();
}

function submitJSONFeedback(data) {
    var wrapper = { source: "UniversalViewer", detail: data };
    var dataJSON = JSON.stringify(wrapper);
    $('#modalForm').attr('action', feedbacksite);
    $('#EventArgs').val(dataJSON);
    $('#modalForm').submit();
}

window.onresize = function () {
    resize();
};

function resize() {
    var width = isFullScreen ? '100%' : '1000px'; 
    var height = isFullScreen ? '100%' : '750px';
    
    $('.uv').width(width);
    $('.uv').height(height);

    $('#app').width(width);
    $('#app').height(height);
}


function checkTestIds() {
    $(document).bind("uv.onCreated", function (event, obj) {
        setTimeout(function () {
            var qs = getQuerystringParameter("testids");

            if (qs === 'true') {
                createTestIds();
            }
        }, 1000);
    });
}


function getPresentationURL() {
    return 'https://' + apiserver + '/metadata/iiif/' + ark + '/manifest.json';
}

function getArk() {
    var url = location.href;
    var startArk = url.indexOf("ark:/81055/");
    if (startArk == -1)
        return "";

    var endArk = url.indexOf("?", startArk);
    if (endArk == -1 || url.indexOf("#", startArk) < endArk)
        endArk = url.indexOf("#", startArk);
    var ark = "";
    if (endArk == -1)
        ark = url.substring(startArk);
    else
        ark = url.substring(startArk, endArk);

    //            if (url.indexOf("ark:/81055/") == -1)
    //                ark = "ark:/81055/vdc_100015688900.0x000002";

    return ark;
}

function getQuerystringParameter(key, doc) {
    if (!doc) doc = window.document;
    key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
    var match = regex.exec(window.location.search);
    return (match ? decodeURIComponent(match[1].replace(/\+/g, " ")) : null);
}

function setQuerystringParameter(key, value, doc) {
    if (!doc) doc = window.document;

    var kvp = updateURIKeyValuePair(doc.location.search.replace('?', ''), key, value);

    // redirects.
    window.location.search = kvp;
}

function updateURIKeyValuePair(uriSegment, key, value) {

    key = encodeURIComponent(key);
    value = encodeURIComponent(value);

    var kvp = uriSegment.split('&');

    // Array.split() returns an array with a single "" item
    // if the target string is empty. remove if present.
    if (kvp[0] == "") kvp.shift();

    var i = kvp.length;
    var x;

    // replace if already present.
    while (i--) {
        x = kvp[i].split('=');

        if (x[0] == key) {
            x[1] = value;
            kvp[i] = x.join('=');
            break;
        }
    }

    // not found, so append.
    if (i < 0) {
        kvp[kvp.length] = [key, value].join('=');
    }

    return kvp.join('&');
}

window.browserDetect = {
    init: function () {
        this.browser = this.searchString(this.dataBrowser) || "Other";
        this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "Unknown";

        // detect IE 11
        if (this.browser == 'Explorer' && this.version == '7' && navigator.userAgent.match(/Trident/i)) {
            this.version = this.searchVersionIE();
        }
    },
    searchString: function (data) {
        for (var i = 0; i < data.length; i++) {
            var dataString = data[i].string;
            this.versionSearchString = data[i].subString;

            if (dataString.indexOf(data[i].subString) != -1) {
                return data[i].identity;
            }
        }
    },
    searchVersion: function (dataString) {
        var index = dataString.indexOf(this.versionSearchString);
        if (index == -1)
            return;
        return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
    },
    searchVersionIE: function () {
        var ua = navigator.userAgent.toString().toLowerCase(), match = /(trident)(?:.*rv:([\w.]+))?/.exec(ua) || /(msie) ([\w.]+)/.exec(ua) || ['', null, -1], ver;
        try {
            ver = match[2].split('.')[0]; // version
        } catch (err) {
            ver = 'unknown'; //
        }
        return ver;
    },
    dataBrowser: [
        { string: navigator.userAgent, subString: "Chrome", identity: "Chrome" },
        { string: navigator.userAgent, subString: "MSIE", identity: "Explorer" },
        { string: navigator.userAgent, subString: "Trident", identity: "Explorer" },
        { string: navigator.userAgent, subString: "Firefox", identity: "Firefox" },
        { string: navigator.userAgent, subString: "Safari", identity: "Safari" },
        { string: navigator.userAgent, subString: "Opera", identity: "Opera" }
    ]
};

window.browserDetect.init();


function getApp() {
    return $('.uv iframe').contents().find('#app');
}

function getHeaderPanel() {
    return getApp().find('.headerPanel');
}

function getMainPanel() {
    return getApp().find('.mainPanel');
}

function getLeftPanel() {
    return getMainPanel().find('.leftPanel');
}

function getCenterPanel() {
    return getMainPanel().find('.centerPanel');
}

function getRightPanel() {
    return getMainPanel().find('.rightPanel');
}

function getFooterPanel() {
    return getApp().find('.footerPanel');
}

function getOverlays() {
    return getApp().find('.overlays');
}

var ids = [
    {
        id: 'fullScreenBtn',
        path: function () {
            return getFooterPanel().find('.options .fullScreen');
        }
    },
    {
        id: 'moreInfoExpandBtn',
        path: function () {
            return getRightPanel().find('.closed .title');
        }
    },
    {
        id: 'moreInfoCollapseBtn',
        path: function () {
            return getRightPanel().find('.top .title');
        }
    },
    {
        id: 'contentsExpandBtn',
        path: function () {
            return getLeftPanel().find('.closed .title');
        }
    },
    {
        id: 'contentsCollapseBtn',
        path: function () {
            return getLeftPanel().find('.top .title');
        }
    },
    {
        id: 'metaDataTitle',
        path: function () {
            return getRightPanel().find('.main .items .title .header');
        }
    },
    {
        id: 'metaDataTitleText',
        path: function () {
            return getRightPanel().find('.main .items .title .text');
        }
    },
    {
        id: 'metaDataTitleMore',
        path: function () {
            return getRightPanel().find('.main .items .title .text .more');
        }
    },
    {
        id: 'metaDataTitleLess',
        path: function () {
            return getRightPanel().find('.main .items .title .text .less');
        }
    },
    {
        id: 'metaDataPlace',
        path: function () {
            return getRightPanel().find('.main .items .place .header');
        }
    },
    {
        id: 'metaDataPlaceText',
        path: function () {
            return getRightPanel().find('.main .items .place .text');
        }
    },
    {
        id: 'metaDataDate',
        path: function () {
            return getRightPanel().find('.main .items .date .header');
        }
    },
    {
        id: 'metaDataDateText',
        path: function () {
            return getRightPanel().find('.main .items .date .text');
        }
    },
    {
        id: 'metaDataCollection',
        path: function () {
            return getRightPanel().find('.main .items .collection .header');
        }
    },
    {
        id: 'metaDataCollectionText',
        path: function () {
            return getRightPanel().find('.main .items .collection .text');
        }
    },
    {
        id: 'metaDataAuthor',
        path: function () {
            return getRightPanel().find('.main .items .author .header');
        }
    },
    {
        id: 'metaDataAuthorText',
        path: function () {
            return getRightPanel().find('.main .items .author .text');
        }
    },
    {
        id: 'metaDataDescription',
        path: function () {
            return getRightPanel().find('.main .items .description .header');
        }
    },
    {
        id: 'metaDataDescriptionText',
        path: function () {
            return getRightPanel().find('.main .items .description .text');
        }
    },
    {
        id: 'metaDataAttribution',
        path: function () {
            return getRightPanel().find('.main .items .attribution .header');
        }
    },
    {
        id: 'metaDataAttributionText',
        path: function () {
            return getRightPanel().find('.main .items .attribution .text');
        }
    },
    {
        id: 'metaDataAttributionMore',
        path: function () {
            return getRightPanel().find('.main .items .attribution .text .more');
        }
    },
    {
        id: 'metaDataAttributionLess',
        path: function () {
            return getRightPanel().find('.main .items .attribution .text .less');
        }
    },
    {
        id: 'metaDataLicense',
        path: function () {
            return getRightPanel().find('.main .items .license .header');
        }
    },
    {
        id: 'metaDataLicenseText',
        path: function () {
            return getRightPanel().find('.main .items .license .text');
        }
    },
    {
        id: 'lastPageBtn',
        path: function () {
            return getHeaderPanel().find('.nextOptions .last');
        }
    },
    {
        id: 'previousPageBtn',
        path: function () {
            return getHeaderPanel().find('.prevOptions .prev');
        }
    },
    {
        id: 'nextPageBtn',
        path: function () {
            return getHeaderPanel().find('.nextOptions .next');
        }
    },
    {
        id: 'firstPageBtn',
        path: function () {
            return getHeaderPanel().find('.prevOptions .first');
        }
    },
    {
        id: 'imageRadioButton',
        path: function () {
            return getHeaderPanel().find('#image');
        }
    },
    {
        id: 'pageRadioButton',
        path: function () {
            return getHeaderPanel().find('#page');
        }
    },
    {
        id: 'pageEditField',
        path: function () {
            return getHeaderPanel().find('.searchText');
        }
    },
    {
        id: 'goBtn',
        path: function () {
            return getHeaderPanel().find('.go');
        }
    },
    {
        id: 'settingsBtn',
        path: function () {
            return getHeaderPanel().find('.settings');
        }
    },
    {
        id: 'closeSettingsBtn',
        path: function () {
            return getOverlays().find('.overlay.settings .close');
        }
    },
    {
        id: 'localeSelect',
        path: function () {
            return getOverlays().find('.overlay.settings #locale');
        }
    },
    {
        id: 'pagingEnabledCheckbox',
        path: function () {
            return getOverlays().find('.overlay.settings #pagingEnabled');
        }
    },
    {
        id: 'indexTab',
        path: function () {
            return getLeftPanel().find('.index.tab');
        }
    },
    {
        id: 'thumbsTab',
        path: function () {
            return getLeftPanel().find('.thumbs.tab');
        }
    },
    {
        id: 'canvasNextBtn',
        path: function () {
            return getCenterPanel().find('.btn.next');
        }
    },
    {
        id: 'canvasPrevBtn',
        path: function () {
            return getCenterPanel().find('.btn.prev');
        }
    },
    {
        id: 'acknowledgements',
        path: function () {
            return getCenterPanel().find('.rights');
        }
    },
    {
        id: 'downloadBtn',
        path: function () {
            return getFooterPanel().find('.download');
        }
    },
    {
        id: 'externalContentDialogue',
        path: function () {
            return getOverlays().find('.externalContent');
        }
    },
    {
        id: 'tile',
        path: function () {
            return getCenterPanel().find('.openseadragon-canvas img').first();
        }
    },
    {
        id: 'moreInfoItems',
        path: function () {
            return getRightPanel().find('.items');
        }
    },
    {
        id: 'titleTextLink',
        path: function () {
            return getRightPanel().find('.title .text a');
        }
    },
    {
        id: 'titleMore',
        path: function () {
            return getRightPanel().find('.title .more');
        }
    },
    {
        id: 'titleLess',
        path: function () {
            return getRightPanel().find('.title .less');
        }
    },
    {
        id: 'licenseText',
        path: function () {
            return getRightPanel().find('.license .text');
        }
    }
];

function createTestIds() {
    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        id.path().prop('id', id.id);
    }

}