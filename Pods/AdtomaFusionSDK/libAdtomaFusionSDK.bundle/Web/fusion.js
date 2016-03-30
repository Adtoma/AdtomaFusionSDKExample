/*global xScrollTop, xScrollLeft, xClientHeight, xClientWidth, xPageY, xPageX, xHeight, xWidth, postscribe */
/*jslint plusplus: true, regexp: true*/

(function fusion(exports) {
    'use strict';

    //Initialize Fusion namespace
    if (exports.Fusion === undefined || exports.Fusion === null) {
        exports.Fusion = {};
    }
    if (exports.Fusion.SDK === undefined || exports.Fusion.SDK === null) {
        exports.Fusion.SDK = {};
    }
    if (exports.Fusion.forceSecureConnection === undefined) exports.Fusion.forceSecureConnection = false;
    if (exports.Fusion.webApp === undefined) exports.Fusion.webApp = "/";
    if (exports.Fusion.forceSecureConnection) {
        exports.Fusion.protocol = "https://";
    } else {
        exports.Fusion.protocol = "//";
    }
    if (exports.Fusion.warnings === undefined) exports.Fusion.warnings = [];
    if (exports.Fusion.parameters === undefined) exports.Fusion.parameters = {};
    if (exports.Fusion.adimpurl === undefined) exports.Fusion.adimpurl = {};
    if (exports.Fusion.adimptpt === undefined) exports.Fusion.adimptpt = {};
    if (exports.Fusion.affiliate === undefined) exports.Fusion.affiliate = undefined;
    if (exports.Fusion.discardStatistics === undefined) exports.Fusion.discardStatistics = false;
    if (exports.Fusion.ATTR_PAYLOAD === undefined) exports.Fusion.ATTR_PAYLOAD = "Payload";
    if (exports.Fusion.ATTR_SHOWN === undefined) exports.Fusion.ATTR_SHOWN = "Shown";
    if (exports.Fusion.usepostscribe === undefined) exports.Fusion.usepostscribe = false;
    if (exports.Fusion.useexcludedAds === undefined) exports.Fusion.useexcludedAds = false;
    if (exports.Fusion.usecheckads === undefined) exports.Fusion.usecheckads = true;
    if (exports.Fusion.Reload === undefined) exports.Fusion.Reload = false;
    if (exports.Fusion.singleSpaceAdIds === undefined) exports.Fusion.singleSpaceAdIds = [];

    var fusionsdk = exports.Fusion.SDK;
    var protocol = exports.Fusion.protocol;

    function getFusionSDKMethod(methodName) {
        if (fusionsdk) {
            return fusionsdk[methodName];
        }
    }

    function pushWarning(message) {
        var sdkFail = getFusionSDKMethod('adError');
        if (sdkFail) {
            sdkFail(message);
        }
        exports.Fusion.warnings.push(message);
    }

    function pushAdsWillLoad() {
        var sdkAdWillLoad = getFusionSDKMethod('adsWillLoad');
        if (sdkAdWillLoad) {
            sdkAdWillLoad();
        }
    }

    function pushAdDidLoad(adId) {
        var sdkAdDidLoad = getFusionSDKMethod('adDidLoad');
        if (sdkAdDidLoad) {
            sdkAdDidLoad(adId);
        }
    }

    function pushNoAdReceived(spaceName) {
        var sdkNoAdReceived = getFusionSDKMethod('noAdReceived');
        if (sdkNoAdReceived) {
            sdkNoAdReceived(spaceName);
        }
    }

    var spaceadId = [],
        jcount = 0,
        adendcount = 0,
        Fusadid = "",
        adcintrvl = {},
        adcno = 0,
        redialok = true,
        xscrloaded = "0";

    exports.Fusion.isScrptLoad = function() {
        if (xscrloaded == "0") {
            var xscriptElement = document.createElement("script");
            xscriptElement.setAttribute("type", "text/javascript");
            if (exports.Fusion.adServer) {
                xscriptElement.setAttribute("src", protocol + exports.Fusion.adServer + "/spl/x.js");
            } else {
                xscriptElement.setAttribute("src", protocol + "fusion.adtoma.com/spl/x.js");
            }
            var xscriptParent = document.getElementsByTagName("head")[0];
            if (!xscriptParent) xscriptParent = document; // no head, enter panic mode
            xscriptParent.appendChild(xscriptElement);
            xscrloaded = "1";
        }
    }

    exports.Fusion.loadjsfile = function(url) {
        var scrptElement = document.createElement("script");
        scrptElement.setAttribute("type", "text/javascript");
        scrptElement.setAttribute("src", url);
        var scriptParent = document.getElementsByTagName("head")[0];
        if (!scriptParent) scriptParent = document; // no head, enter panic mode
        scriptParent.appendChild(scrptElement);
    }

    /* If a given element is visible or not? */
    exports.Fusion.isElementVisible = function(eltId, adw, adh) {
        var elt = document.getElementById(eltId);
        var InScreen = "0";
        if (!elt) {
            // Element not found. 
            return false;
        }
        // Get the top and bottom position of the *visible* part of the exports. 
        var By1 = xScrollTop();
        var Bx1 = xScrollLeft();
        var By2 = By1 + xClientHeight();
        var Bx2 = Bx1 + xClientWidth();
        // Get the top and bottom position of the given element. 

        var Ay1 = xPageY(elt);
        var Ax1 = xPageX(elt);

        var Ay2 = Ay1 + xHeight(elt);
        var Ax2 = Ax1 + xWidth(elt);
        if (Bx2 < Ax1 || Bx1 > Ax2) {
            // Element not found. 
            return InScreen;
        }
        //Calculate common part of the two rectangles you see in the browser 
        var Vy1 = Math.max(By1, Ay1);
        var Vx1 = Math.max(Bx1, Ax1);
        var Vy2 = Math.min(By2, Ay2);
        var Vx2 = Math.min(Bx2, Ax2);

        //field of the visible part
        var Fvis = (Vx2 - Vx1) * (Vy2 - Vy1);

        if (Fvis > 0) {
            //field of the ad
            var Fad = (Ax2 - Ax1) * (Ay2 - Ay1);
            var InScreen = Math.round((Fvis / Fad) * 100);
        }
        return InScreen;
    }

    if (!ismobj) {
        var ismobj = [];
    }
    if (!ismobjw) {
        var ismobjw = [];
    }
    if (!ismobjh) {
        var ismobjh = [];
    }
    if (!ismobjev) {
        var ismobjev = [];
    }
    if (!ismobjtmr) {
        var ismobjtmr = [];
    }
    if (!ismobjOK) {
        var ismobjOK = [];
    }
    if (!ismobjtmo) {
        var ismobjtmo = [];
    }
    if (!ismobjisp) {
        var ismobjisp = [];
    }
    if (!ismobjintrvl) {
        var ismobjintrvl = [];
    }
    if (!dothisOnce) {
        var dothisOnce = [];
    }
    if (!ismcnt) {
        var ismcnt = 0;
    }
    if (!ismping) {
        var ismping;
    }
    if (!fusionmainISchk) {
        var fusionmainISchk;
    }
    if (!fusionBrwsrchk) {
        var fusionBrwsrchk;
    }
    if (!fusionBrwsrval) {
        var fusionBrwsrval;
    }
    if (!EvTracking) {
        var EvTracking = {};
    }

    exports.Fusion.doismcall = function() {
        for (ismcnt = 0; ismcnt < ismobj.length; ismcnt++) {
            ismping = exports.Fusion.isElementVisible(ismobj[ismcnt]);
            if (ismping >= ismobjisp[ismcnt] && fusionBrwsrval == 1) {
                if (ismobjtmo[ismcnt] == "0" && ismobjtmr[ismcnt] < 61) {
                    ismobjtmo[ismcnt] = "1";
                    ismobjintrvl[ismcnt] = setInterval("exports.Fusion.doIntrvlcnt(" + ismcnt + ")", 1000);
                }
                if (ismobjOK[ismcnt] == "1") {
                    ismobjOK[ismcnt] = "0";
                    if (ismobjtmr[ismcnt] == "0" && dothisOnce[ismcnt] == "1") {
                        dothisOnce[ismcnt] = "0";
                        EvTracking[ismcnt].src = protocol + ismobjev[ismcnt]["inscr"];
                    } else {
                        exports.Fusion.doismEventcnt(ismcnt);
                    }
                }
            } else if (ismobjintrvl[ismcnt]) {
                clearInterval(ismobjintrvl[ismcnt]);
            }
            ismobjOK[ismcnt] = "1";
            ismobjtmo[ismcnt] = "0";
        }
    }

    exports.Fusion.doIntrvlcnt = function(ismcnt) {
        ismobjtmr[ismcnt] = ismobjtmr[ismcnt] + 1;
        dothisOnce[ismcnt] = "1";
        ismobjOK[ismcnt] = "1";
    }

    exports.Fusion.doismEventcnt = function(ismcnt) {
        if (ismobjev[ismcnt]["inscr"] != "") {
            if (ismobjtmr[ismcnt] == "1" && dothisOnce[ismcnt] == "1") {
                //1 sek
                dothisOnce[ismcnt] = "0";
                EvTracking[ismcnt].src = protocol + ismobjev[ismcnt]["inscrtime1"];
                ismobjOK[ismcnt] = "1";
            } else if (ismobjtmr[ismcnt] == "2" && dothisOnce[ismcnt] == "1") {
                //2 sek
                dothisOnce[ismcnt] = "0";
                EvTracking[ismcnt].src = protocol + ismobjev[ismcnt]["inscrtime2"];
                ismobjOK[ismcnt] = "1";
            } else if (ismobjtmr[ismcnt] == "4" && dothisOnce[ismcnt] == "1") {
                //4 sek
                dothisOnce[ismcnt] = "0";
                EvTracking[ismcnt].src = protocol + ismobjev[ismcnt]["inscrtime4"];
                ismobjOK[ismcnt] = "1";
            } else if (ismobjtmr[ismcnt] == "7" && dothisOnce[ismcnt] == "1") {
                //7 sek
                dothisOnce[ismcnt] = "0";
                EvTracking[ismcnt].src = protocol + ismobjev[ismcnt]["inscrtime7"];
                ismobjOK[ismcnt] = "1";
            } else if (ismobjtmr[ismcnt] == "12" && dothisOnce[ismcnt] == "1") {
                //12 sek
                dothisOnce[ismcnt] = "0";
                EvTracking[ismcnt].src = protocol + ismobjev[ismcnt]["inscrtime12"];
                ismobjOK[ismcnt] = "1";
            } else if (ismobjtmr[ismcnt] == "20" && dothisOnce[ismcnt] == "1") {
                //20 sek
                dothisOnce[ismcnt] = "0";
                EvTracking[ismcnt].src = protocol + ismobjev[ismcnt]["inscrtime20"];
                ismobjOK[ismcnt] = "1";
            } else if (ismobjtmr[ismcnt] == "30" && dothisOnce[ismcnt] == "1") {
                //30 sek
                dothisOnce[ismcnt] = "0";
                EvTracking[ismcnt].src = protocol + ismobjev[ismcnt]["inscrtime30"];
                ismobjOK[ismcnt] = "1";
            } else if (ismobjtmr[ismcnt] == "40" && dothisOnce[ismcnt] == "1") {
                //40 sek
                dothisOnce[ismcnt] = "0";
                EvTracking[ismcnt].src = protocol + ismobjev[ismcnt]["inscrtime40"];
                ismobjOK[ismcnt] = "1";
            } else if (ismobjtmr[ismcnt] == "50" && dothisOnce[ismcnt] == "1") {
                //50 sek
                dothisOnce[ismcnt] = "0";
                EvTracking[ismcnt].src = protocol + ismobjev[ismcnt]["inscrtime50"];
                ismobjOK[ismcnt] = "1";
            } else if (ismobjtmr[ismcnt] == "60" && dothisOnce[ismcnt] == "1") {
                //60 sek
                dothisOnce[ismcnt] = "0";
                EvTracking[ismcnt].src = protocol + ismobjev[ismcnt]["inscrtime60"];
                ismobjOK[ismcnt] = "1";
                clearInterval(ismobjintrvl[ismcnt]);
                ismobjtmr[ismcnt] = ismobjtmr[ismcnt] + 1;
            }
        }
    }

    exports.Fusion.pick_event = function(evname, cnt) {
        var evname = evname.toLowerCase();
        var fus_eventads = exports.Fusion.adServer;
        var eventname = evname + ":";
        if (ismobjev[cnt][0].search(evname) != -1) {
            var realevent = ismobjev[cnt][0].split(eventname);
            realevent = realevent[1].split('"');
            return fus_eventads + "/" + realevent[0];
        }
    }

    exports.Fusion.chkBrwsrFoc = function() {
        if (navigator.appName == 'Microsoft Internet Explorer') {
            document.onfocusout = function() {
                fusionBrwsrchk = setTimeout("FusOnWinBlur()", 20000);
            }
            document.onfocusin = function() {
                FusOnWinFocus();
            }
        } else {
            exports.onblur = function() {
                fusionBrwsrchk = setTimeout("FusOnWinBlur()", 20000);
            }
            exports.onfocus = function() {
                FusOnWinFocus();
            }
        }
    }

    function FusOnWinFocus() {
        clearTimeout(fusionBrwsrchk);
        fusionBrwsrval = 1;
    }

    function FusOnWinBlur() {
        fusionBrwsrval = 0;
    }

    /**
     * Adds a warning if a field in exports.Fusion doesn't exist.
     */
    exports.Fusion.assertFieldExists = function(field) {
        if (exports.Fusion[field] === undefined) {
            pushWarning("Assertion failed: Field \"" + field + "\" is undefined");
            return false;
        }
        return true;
    };

    /**
     * Shows all warnings.
     */
    exports.Fusion.showWarnings = function() {
        var w, msg = exports.Fusion.warnings.length ? exports.Fusion.warnings.length + " warning/s:\n" + exports.Fusion.warnings.join("\n") : "No warnings.";
        if (!exports.Fusion.warnings.length || !(w = exports.open("about:blank", "_blank", "width=800,height=600"))) alert(msg);
        else {
            w.document.open("text/plain");
            w.document.writeln(msg);
            w.document.close();
        }
    }

    /**
     * Randomizes a number in the interval [low, high)
     */
    exports.Fusion.randomInterval = function(low, high) {
        return Math.floor((Math.random() * (high - low)) + low);
    };

    /**
     * Randomizes a string (character a-z) of length len.
     */
    exports.Fusion.randomAsciiString = function(len) {
        var ret = "";
        while (len-- > 0)
            ret += String.fromCharCode(exports.Fusion.randomInterval('a'.charCodeAt(0), 'z'.charCodeAt(0) + 1));
        return ret;
    }

    /**
     * Does a minimal HTML encoding of a string.
     */
    exports.Fusion.htmlEncode = function(s) {
        return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\'/g, "&#39;").replace(/\"/g, "&quot;");
    }

    /**
     * Expands special symbols in a component attribute.
     */
    exports.Fusion.expandAttribute = function(comp, attr, visited) {
        if (!visited) visited = [];
        var funcs = {
            "htmlEncode": exports.Fusion.htmlEncode,
            "uriEncode": encodeURIComponent
        };
        return comp.attributes[attr].replace(/(\{{1,2})%([^%]+)%\}/g, function(match, braces, content) {
            if (braces.length == 2) return "{%" + content + "%}"; // double braces quote
            var parts = content.split(":");
            var content = parts.pop().replace(/^([^\.]+)\.?(.*)$/, function(match2, prefix, suffix) {
                switch (prefix) {
                    case "Fusion":
                        if (exports.Fusion[suffix] === undefined) {
                            exports.Fusion.warnings.push("Tried to expand unknown Fusion attribute: " + suffix);
                            return "Fusion." + suffix;
                        } else return exports.Fusion[suffix].toString();
                    case "attribute":
                        for (var vindex = 0; vindex < visited.length; ++vindex) {
                            if (visited[vindex] == suffix) {
                                exports.Fusion.warnings.push("Expanding attribute '" + attr +
                                    "' causes infinite recursion. Stack is " + visited);
                                return match2;
                            }
                        }
                        visited.push(suffix);
                        var ret = exports.Fusion.expandAttribute(comp, visited);
                        visited.pop();
                        return ret;
                    case "r":
                        return exports.Fusion.randomAsciiString(suffix ? parseInt(suffix, 10) : 5);
                    case "eventUrl":
                        return exports.Fusion.getAdvertEventUrl(comp.ad, suffix);
                    case "parameters":
                        return exports.Fusion.getParameters();
                    case "adId":
                        return comp.ad.toString();
                    default:
                        exports.Fusion.warnings.push("Tried to expand unknown macro: " + match2);
                        return match2;
                }
            });
            while (parts.length > 0) {
                var funcName = parts.pop();
                var f = funcs[funcName];
                if (f === undefined) exports.Fusion.warnings.push("Bad macro function: " + funcName);
                else content = f(content);
            }
            return content;
        });
    }

    exports.Fusion.getComponent = function(placementName, attribute) {
        if (attribute === undefined)
            attribute = exports.Fusion.ATTR_PAYLOAD;
        if (exports.Fusion.assertFieldExists("adComponents")) {
            var components = exports.Fusion.adComponents[placementName];
            var component = null;
            var isadBegin = "";
            var isadEnd = "";
            if (!(components instanceof Array) || components.length === 0) {
                //exports.Fusion.warnings.push("Tried to show ad for non-existing placement " + placementName);
                return null;
            } else if (typeof((component = components.shift()).attributes[attribute]) != typeof("")) {
                pushWarning("Component on placement " + placementName + " for ad " + component.ad + " missing " + attribute + " attribute");
                return null;
            } else {
                //DanChr: we will need that later for checking, which ads were displayed
                component.attributes[exports.Fusion.ATTR_SHOWN] = true;
                if (component.attributes["COUNTINSCREEN"] != undefined && component.attributes["ISEVENTS"] != undefined && component.attributes["ISPERCENTAGE"] != undefined) {
                    if (component.attributes["COUNTINSCREEN"] == "Yes") {
                        EvTracking[ismcnt] = new Image();
                        ismobj[ismcnt] = "Span-" + placementName + "-adid-" + component.ad;
                        ismobjev[ismcnt] = [component.attributes["ISEVENTS"]];
                        ismobjev[ismcnt]["inscr"] = exports.Fusion.pick_event("INSCREEN", ismcnt);
                        ismobjev[ismcnt]["inscrtime1"] = exports.Fusion.pick_event("ISTIME1", ismcnt);
                        ismobjev[ismcnt]["inscrtime2"] = exports.Fusion.pick_event("ISTIME2", ismcnt);
                        ismobjev[ismcnt]["inscrtime4"] = exports.Fusion.pick_event("ISTIME4", ismcnt);
                        ismobjev[ismcnt]["inscrtime7"] = exports.Fusion.pick_event("ISTIME7", ismcnt);
                        ismobjev[ismcnt]["inscrtime12"] = exports.Fusion.pick_event("ISTIME12", ismcnt);
                        ismobjev[ismcnt]["inscrtime20"] = exports.Fusion.pick_event("ISTIME20", ismcnt);
                        ismobjev[ismcnt]["inscrtime30"] = exports.Fusion.pick_event("ISTIME30", ismcnt);
                        ismobjev[ismcnt]["inscrtime40"] = exports.Fusion.pick_event("ISTIME40", ismcnt);
                        ismobjev[ismcnt]["inscrtime50"] = exports.Fusion.pick_event("ISTIME50", ismcnt);
                        ismobjev[ismcnt]["inscrtime60"] = exports.Fusion.pick_event("ISTIME60", ismcnt);
                        ismobjtmr[ismcnt] = 0;
                        ismobjOK[ismcnt] = "1";
                        dothisOnce[ismcnt] = "1";
                        ismobjtmo[ismcnt] = "0";
                        ismobjisp[ismcnt] = component.attributes["ISPERCENTAGE"];

                        if (ismcnt == "0") {
                            fusionmainISchk = setInterval("exports.Fusion.doismcall()", 100);
                            fusionBrwsrval = 1;
                            exports.Fusion.chkBrwsrFoc();
                        }

                        isadBegin = '<span id="Span-' + placementName + '-adid-' + component.ad + '" style="display:block">';
                        if (exports.Fusion.adServer) {
                            adendcount = 0;
                            isadEnd = '<scr' + 'ipt src="' + protocol + exports.Fusion.adServer + '/spl/fusion_adend.js"></scr' + 'ipt>';
                        } else {
                            adendcount = 0;
                            isadEnd = '<scr' + 'ipt src="' + protocol + 'fusion.adtoma.com/spl/fusion_adend.js"></scr' + 'ipt>';
                        }
                        ismcnt = ismcnt + 1;
                    }
                }
                spaceadId[placementName + jcount] = component.ad;
                jcount = jcount + 1;
                return isadBegin + '<div id="FusSpace-' + placementName + '-adid-' + component.ad + '" style="display:none;width:0px;height:0px"></div>' + exports.Fusion.expandAttribute(component, attribute) + isadEnd;
            }
        } else return null;
    }

    exports.Fusion.getComponentB = function(placementName, attribute) {
        if (attribute === undefined)
            attribute = exports.Fusion.ATTR_PAYLOAD;
        if (exports.Fusion.assertFieldExists("adComponents")) {
            var components = exports.Fusion.adComponents[placementName];
            var component = null;
            if (!(components instanceof Array) || components.length === 0) {
                return null;
            } else if (typeof((component = components.shift()).attributes[attribute]) !== typeof("")) {
                pushWarning("Component on placement " + placementName + " for ad " + component.ad + " missing " + attribute + " attribute");
                return null;
            } else {
                //DanChr: we will need that later for checking, which ads were displayed
                component.attributes[exports.Fusion.ATTR_SHOWN] = true;
                Fusadid = component.ad;
                //For passback excluding, Moved to fireonadsloaded to be performed in case passback is loaded on first space exports.Fusion.singleSpaceAdIds.push(component.ad);
                return exports.Fusion.expandAttribute(component, attribute);
            }
        }
        return null;
    };

    /**
     * Checks which spaces displayed ads.
     */
    exports.Fusion.checkAds = function() {
        var url = exports.Fusion.getUrlToFile("report");
        // Add mandatory params
        url += "/" + exports.Fusion.randomAsciiString(5);
        url += "/" + encodeURIComponent(exports.Fusion.mediaZone);
        url += "/" + encodeURIComponent(exports.Fusion.layout);
        // Add affiliate, if one is specified
        if (exports.Fusion.affiliate !== undefined)
            url += "/" + encodeURIComponent(exports.Fusion.affiliate);
        // Add optional params
        var query = "Fusion.CountersTimeStamp=" + encodeURIComponent(exports.Fusion.CountersTimeStamp);
        for (var param in exports.Fusion.parameters) {
            if (!exports.Fusion.parameters.hasOwnProperty(param))
                continue;
            var values = (exports.Fusion.parameters[param] instanceof Array) ? exports.Fusion.parameters[param] : [exports.Fusion.parameters[param]];
            for (var idx = 0; idx < values.length; ++idx) {
                if (query.length > 0)
                    query += "&";
                query += encodeURIComponent(param) + "=" + encodeURIComponent(values[idx] + "");
            }
        }
        var urlLocal = exports.location.protocol + "//" + exports.location.host + "/" + exports.location.pathname;
        if (query.length > 0)
            query += "&";
        query += "Fusion.Url=" + encodeURI(urlLocal);
        var sendRequest = false;
        if (exports.Fusion.adComponents !== undefined) {
            for (var space in exports.Fusion.adComponents) {
                if (exports.Fusion.adComponents[space].length > 0) {
                    var component = exports.Fusion.adComponents[space].shift();
                    if (component.attributes[exports.Fusion.ATTR_SHOWN] === undefined) {
                        //For now just add it to wornings
                        exports.Fusion.warnings.push("There is an ad(id:" + component.ad + ") for space(name:" + space + ") which is not displayed on the page.");
                        if (query.length > 0)
                            query += "&";
                        query += "Fusion.AdID=" + component.ad;
                        query += "&";
                        query += "Fusion.Flags=" + component.flags;
                        query += "&";
                        query += "Fusion.AcgID=" + component.id;

                        if (!sendRequest)
                            sendRequest = true;
                    }
                }
            }
        }
        //Later on, send it to reactor
        if (sendRequest) {
            url += "?" + query;
            //Call script
            var scriptElement = document.createElement("script");
            scriptElement.setAttribute("type", "text/javascript");
            scriptElement.setAttribute("src", url);
            document.body.appendChild(scriptElement);
        }
    }

    /**
     * Constructs a parameter list in URL format from exports.Fusion.parameters.
     */
    exports.Fusion.getParameters = function() {
        var parameterString = "";
        var prefix = "";
        var prm = exports.Fusion.parameters;
        for (var p in prm) {
            if (!prm.hasOwnProperty(p)) continue;
            var allValues;
            if (exports.Fusion.parameters[p] instanceof Array) {
                allValues = exports.Fusion.parameters[p];
            } else {
                allValues = [exports.Fusion.parameters[p]];
            }
            for (var j = 0; j < allValues.length; ++j) {
                parameterString += prefix + p + "=" + allValues[j];
                // prefix has been used once, set to &
                prefix = "&";
            }
        }
        return parameterString;
    }

    /**
     * Constructs the base URL for an advert event call.
     * @param advertId The advert for which the event happened.
     * @param eventName The name of the event
     * @param redirectUrl Optional. If provided, the event counter will redirect the request to this URL.
     */
    exports.Fusion.getAdvertEventUrl = function(advertId, eventName, redirectUrl) {
        var url = exports.Fusion.getUrlToFile("event");
        url += "/" + exports.Fusion.randomAsciiString(5);
        url += "/" + encodeURIComponent(exports.Fusion.mediaZone);
        url += "/" + encodeURIComponent(advertId);
        url += "/" + encodeURIComponent(eventName)
        if (exports.Fusion.affiliate !== undefined)
            url += "/" + encodeURIComponent(exports.Fusion.affiliate);
        if (redirectUrl !== undefined)
            url += "?url=" + encodeURIComponent(redirectUrl);
        return url;
    }

    /**
     * Notify the ad server that an event has occurred for an ad.
     *
     * Please note that adding a call to this function in, e.g., a
     * link's onclick event doesn't always work as it doesn't capture
     * clicks from right-clicks or middle-clicks.
     *
     * @param advertId The ID of the advert
     * @param eventName The name of the event (e.g., "click")
     * @param redirectUrl The URL to redirect the user to. If this parameter
     * is unspecified, response from the servlet is "204 no content".
     * @param target The name of the window to open (equivalent to the "target"
     * attribute in HTML anchors). Defaults to "_blank".
     */
    exports.Fusion.countAdvertEvent = function(advertId, eventName, redirectUrl, target) {
        var url = exports.Fusion.getAdvertEventUrl(advertId, eventName, redirectUrl);
        if (redirectUrl !== undefined) {
            // target defined? if not, use a new window
            if (target === undefined) target = "_blank";
            // acrobatics to get around popup blockers
            if (!exports.open(url, target)) location.href = url;
        } else {
            // No redirect, do an asynchronous call and ignore whatever 
            // response there is (since it will be a 204). Add a random
            // string to prevent caching.
            var img = new Image();
            img.src = url;
        }
    }

    /**
     * This has been extended to include parameters in the call.
     */
    exports.Fusion.countAdvertEventWithParameters = function(advertId, eventName, redirectUrl, target) {
        var parameters = "YES";
        var url = exports.Fusion.getAdvertEventUrl(advertId, eventName, redirectUrl, parameters);
        if (redirectUrl !== undefined) {
            // target defined? if not, use a new window
            if (target === undefined) target = "_blank";
            // acrobatics to get around popup blockers
            if (!exports.open(url, target)) location.href = url;
        } else {
            // No redirect, do an asynchronous call and ignore whatever 
            // response there is (since it will be a 204). Add a random
            // string to prevent caching.
            var img = new Image();
            img.src = url;
        }
    }

    exports.Fusion.adEnding = function() {
        adendcount++;
        if (exports.Fusion.adServer) {
            document.write('<scr' + 'ipt src="' + protocol + exports.Fusion.adServer + '/spl/fusion_adend.js"></scr' + 'ipt>');
        } else {
            document.write('<scr' + 'ipt src="' + protocol + 'fusion.adtoma.com/spl/fusion_adend.js"></scr' + 'ipt>');
        }
    }

    /**
     * Shows an ad for a placement.
     */
    exports.Fusion.space = function(placementName) {
        var loaded = false;
        if (exports.Fusion.adComponents !== undefined) {
            var component = exports.Fusion.adComponents[placementName];
            var adId;
            if (component && component.length > 0) {
                adId = component[0].ad;
            }
            var componentContent = exports.Fusion.getComponent(placementName);
            if ((typeof componentContent) === (typeof "")) {
                exports.document.writeln(componentContent);
                // notify ad did load
                pushAdDidLoad(adId);
                loaded = true;
            }
        }
        if (!loaded) {
            pushWarning("No ads loaded when trying to show space " + placementName);
            pushNoAdReceived(placementName);
        }
    };

    /**
     * Performs an ad call, and shows the sole ad from that call.
     */
    exports.Fusion.SingleSpace = function(layout) {
        if (layout === undefined) {
            pushWarning("Missing layout in SingleSpace");
            pushNoAdReceived("");
            return;
        }
        this.mediaZone = exports.Fusion.mediaZone;
        this.affiliate = exports.Fusion.affiliate;
        this.parameters = {};
        var prm = exports.Fusion.parameters;
        // make deep copy of parameters
        for (var p in prm) {
            if (!prm.hasOwnProperty(p)) continue;
            this.parameters[p] = (prm[p] instanceof Array) ? prm[p].slice(0) : prm[p];
        }
        this.show = function() {
            this.url = exports.Fusion.getJsUrl(
                this.mediaZone || exports.Fusion.mediaZone,
                layout,
                this.affiliate || exports.Fusion.affiliate,
                this.parameters || exports.Fusion.parameters);
            exports.Fusion.onAdsLoaded = function(ads, timestamp) {
                exports.Fusion.CountersTimeStamp = timestamp;
                var ncomponents = 0;
                var payload = undefined,
                    component = undefined,
                    adId = 0;
                for (var i in ads) {
                    if (!ads.hasOwnProperty(i)) continue;
                    if ((ncomponents += ads[i].length) > 1) {
                        pushWarning("SingleSpace call returned more than one component");
                        pushNoAdReceived("");
                        return;
                    }
                    if (ads[i].length > 0) {
                        payload = (component = ads[i][0]).attributes[exports.Fusion.ATTR_PAYLOAD];
                        adId = component[0].ad;
                    }
                }
                if (payload === undefined) {
                    pushWarning(ncomponents > 0 ? "None of the " + ncomponents + " components found had attribute " + exports.Fusion.ATTR_PAYLOAD : "No components found for SingleSpace call");
                    pushNoAdReceived("");
                    return;
                }
                document.write(exports.Fusion.expandAttribute(component, exports.Fusion.ATTR_PAYLOAD));
                pushAdDidLoad(adId);
            } // onAdsLoaded(ads)
            document.writeln("<script type=\"text/javascript\" src=\"" + exports.Fusion.htmlEncode(this.url) + "\"></script>");
        } // show()
    }

    /**
     * Gets an absolute URL to a "file" in the Fusion webapp.
     */
    exports.Fusion.getUrlToFile = function(file) {
        exports.Fusion.assertFieldExists("protocol");
        exports.Fusion.assertFieldExists("webApp");
        exports.Fusion.assertFieldExists("adServer");
        return exports.Fusion.protocol + exports.Fusion.adServer + Fusion.webApp + file;
    }

    exports.Fusion.getJsUrl = function(mediaZone, layout, affiliate, params) {
        var servletName = exports.Fusion.discardStatistics ? "jsds" : "js";
        var baseUrl = exports.Fusion.getUrlToFile(servletName);
        // Add mandatory params
        baseUrl += "/" + exports.Fusion.randomAsciiString(5);
        baseUrl += "/" + encodeURIComponent(mediaZone);
        baseUrl += "/" + encodeURIComponent(layout);
        // Add affiliate, if one is specified
        if (affiliate !== undefined)
            baseUrl += "/" + encodeURIComponent(affiliate);
        // Add optional params
        var queryString = "";
        for (var i in params) {
            if (!params.hasOwnProperty(i)) continue;
            var allValues = (params[i] instanceof Array) ? params[i] : [params[i]];
            for (var j = 0; j < allValues.length; ++j) {
                if (queryString.length > 0) queryString += "&";
                queryString += encodeURIComponent(i) + "=" + encodeURIComponent(allValues[j] + "");
            }
        }
        if (queryString.length > 0) queryString = "?" + queryString;
        return baseUrl + queryString;
    }

    exports.Fusion.updateSpace = function(elementId, spaceName) {
        var elmt = document.getElementById(elementId);
        if (elmt == null) {
            redialok = true;
            return;
        }
        var content = exports.Fusion.getComponentB(spaceName);
        if (content != null) {
            if (exports.Fusion.usepostscribe) {
                elmt.innerHTML = "";
                postscribe(elmt, content);
            } else {
                var olddw = document.write;
                document.write = function(s) {
                    elmt.innerHTML += s;
                };
                if (content.search('<script id="' + Fusadid + '"') != -1) {
                    content = content.replace('<script id="' + Fusadid + '">', "");
                    content = content.replace('<script id="' + Fusadid + '" type="text/javascript">', "");
                } else {
                    content = content.replace("<script>", "");
                    content = content.replace("<script type=\"text/javascript\">", "");
                }
                content = content.replace("</scr" + "ipt>", "");
                var script = document.createElement("script");
                script.setAttribute("type", "text/javascript");
                script.setAttribute("id", Fusadid);
                script.text = content;
                elmt.innerHTML = "";
                elmt.appendChild(script);
                Fusadid = "";
                document.write = olddw;
            }
        }

        redialok = true;
    }

    exports.Fusion.callbackUpdateSpace = function(el, sp) {
        exports.Fusion.updateSpace(el, sp);
    }

    /**
     * Makes a smarttag call.
     */
    exports.Fusion.loadAds = function(loadByDom, onloadCallback, divn, spn, q) {
        pushAdsWillLoad();
        if (!q) {
            q = 1;
            adcno = adcno + 1;
        }
        if (redialok == true) {
            redialok = false;
            if (adcintrvl[q]) {
                clearInterval(adcintrvl[q]);
            }
            exports.Fusion.isScrptLoad();
            exports.Fusion.assertFieldExists("mediaZone");
            exports.Fusion.assertFieldExists("layout");
            if (loadByDom) {
                if (exports.Fusion.Reload) {
                    exports.Fusion.parameters["reload"] = "true";
                }
            }

            if (exports.Fusion.useexcludedAds == true) {
                exports.Fusion.parameters["excludedAds"] = exports.Fusion.singleSpaceAdIds;
            }
            if (exports.Fusion.useexcludedAds == false) {
                exports.Fusion.parameters["excludedAds"] = [];
            }
            exports.Fusion.adScriptUrl = exports.Fusion.getJsUrl(
                exports.Fusion.mediaZone, exports.Fusion.layout,
                exports.Fusion.affiliate, exports.Fusion.parameters);
            exports.Fusion.onAdsLoaded = function(ads, timestamp) {
                exports.Fusion.adComponents = ads;
                exports.Fusion.CountersTimeStamp = timestamp;
                if (onloadCallback !== undefined) {
                    if (onloadCallback !== false) {
                        onloadCallback();
                    } else if (divn !== undefined && spn !== undefined) {
                        exports.Fusion.callbackUpdateSpace(divn, spn);
                    }
                }
                if (exports.Fusion.usecheckads) {
                    exports.Fusion.addOnPageLoad(exports.Fusion.checkAds);
                }
            };

            if (loadByDom) {
                if (exports.Fusion.usepostscribe) {
                    if (typeof postscribe != 'function') {
                        exports.Fusion.loadjsfile(protocol + exports.Fusion.adServer + "/spl/postscribe/htmlParser.js");
                        exports.Fusion.loadjsfile(protocol + exports.Fusion.adServer + "/spl/postscribe/postscribe.js");
                    }
                }
                exports.Fusion.postscrAdcall = function() {
                    if (typeof postscribe == 'function') {
                        clearInterval(adcallintrvl);
                        exports.Fusion.loadjsfile(exports.Fusion.adScriptUrl);
                    }
                };
                if (exports.Fusion.usepostscribe) {
                    adcallintrvl = setInterval("exports.Fusion.postscrAdcall();", 10);
                } else {
                    exports.Fusion.loadjsfile(exports.Fusion.adScriptUrl);
                }
            } else {
                redialok = true;
                document.writeln("<script type=\"text/javascript\" src=\"" +
                    exports.Fusion.htmlEncode(exports.Fusion.adScriptUrl) + "\">");
                document.writeln("</script>");
            }
        } else if (!adcintrvl[adcno]) {
            if (divn !== undefined && spn !== undefined) {
                adcintrvl[adcno] = setInterval("exports.Fusion.loadAds(" + loadByDom + "," + onloadCallback + ",'" + divn + "','" + spn + "'," + adcno + ")", 100);
            } else {
                adcintrvl[adcno] = setInterval("exports.Fusion.loadAds(" + loadByDom + "," + onloadCallback + ",'',''," + adcno + ")", 100);
            }
        }
    }

    /**
     * Thin cross-browser abstraction to run an onload function.
     */
    exports.Fusion.addOnPageLoad = function(onLoadFunc) {
        if (exports.addEventListener) { // DOM events
            exports.addEventListener("load", function loadHandler() {
                onLoadFunc();
                exports.removeEventListener("load", loadHandler, false);
            }, false);
        } else if (exports.attachEvent) { // IE
            exports.attachEvent("onload", function loadHandler() {
                onLoadFunc();
                exports.detachEvent("onload", loadHandler);
            });
        } else { // Unsafe intrinsic events
            var oldOnLoad = exports.onload;
            exports.onload =
                (typeof(oldOnLoad) !== "function") ?
                onLoadFunc : function() {
                    var ret = oldOnLoad.apply(this, arguments);
                    onLoadFunc();
                    return ret;
            };
        }
    };

    /**
     * If there are any ad components left in the components argument,
     * appropriate action is taken.
     */
    exports.Fusion.verifyTagging = function(components) {
        var neglected = [];
        for (var placement in components) {
            if (!components.hasOwnProperty(placement)) continue;
            if (components[placement] instanceof Array && components[placement].length > 0) {
                neglected.push({
                    placement: placement,
                    count: components[placement].length,
                    toString: function() {
                        return "Placement '" + this.placement + "' is missing " + this.count + " tag(s)";
                    }
                });
            }
        }
        if (neglected.length > 0)
            exports.Fusion.warnings.push("Not all spaces in layout have been tagged:\n\t" + neglected.join("\n\t"));
    }

    /**
     * Handlers for the metadata information sent to fireOnAdsLoaded
     */
    exports.Fusion.adSelectionMetaDataHandlers = {
        "warnings": function(warnings) {
            for (var i = 0; i < warnings.length; ++i)
                pushWarning(warnings[i]);
        },
        "diagnostics": function(root) {
            function indent(n) {
                var r = "";
                while (n-- > 0) r += "    ";
                return r;
            }

            function entry2html(entry, depth) {
                var cls = "status-" + exports.Fusion.htmlEncode(entry.status.toLowerCase());
                var msg = exports.Fusion.htmlEncode(entry.message);
                if (entry.subEntries.length == 0) {
                    return indent(depth) + "<li class=\"" + cls + "\">" + msg + "</li>\n";
                } else {
                    return (indent(depth) + "<li class=\"" + cls + "\">\n" +
                        indent(depth + 1) + msg + "\n" +
                        entries2html(entry.subEntries, depth + 1) + "\n" +
                        indent(depth) + "</li>\n");
                }
            }

            function entries2html(entries, depth) {
                var items = [];
                for (var i = 0; i < entries.length; ++i)
                    items.push(entry2html(entries[i], depth + 1));
                if (items.length > 0) {
                    items.unshift(indent(depth) + "<ul>\n");
                    items.push(indent(depth) + "</ul>\n");
                }
                return items.join("");
            }
            var win = exports.open("about:blank", "_blank");
            if (win) {
                var oldProtocol = exports.Fusion.protocol;
                exports.Fusion.protocol = "http://";
                win.document.open("text/html");
                win.document.writeln("<html><head>");
                win.document.writeln(indent(1) + "<title>Selection diagnostics</title>");
                win.document.writeln(indent(1) + "<link rel=\"stylesheet\" href=\"" +
                    exports.Fusion.htmlEncode(exports.Fusion.getUrlToFile("util/diagnostics.css")) + "\" />");
                win.document.writeln(indent(1) + "<script type=\"text/javascript\" src=\"" +
                    exports.Fusion.htmlEncode(exports.Fusion.getUrlToFile("util/sorttable.js")) + "\"></script>");
                win.document.writeln("</head><body>");
                if (root.table) {
                    win.document.writeln("<table class=\"sortable\">");
                    win.document.writeln(indent(1) + "<caption>Inspected ads</caption>");
                    win.document.writeln(indent(1) + "<thead>");
                    win.document.writeln(indent(2) + "<tr>");
                    var headers = root.table.headers;
                    for (var i = 0; i < headers.length; ++i)
                        win.document.writeln(indent(3) + "<th>" + exports.Fusion.htmlEncode(headers[i]) + "</th>");
                    win.document.writeln(indent(2) + "</tr>");
                    win.document.writeln(indent(1) + "</thead>");
                    win.document.writeln(indent(1) + "<tbody>");
                    for (var i = 0; i < root.table.rows.length; ++i) {
                        win.document.writeln(indent(2) + "<tr>");
                        var row = root.table.rows[i];
                        for (var j = 0; j < row.length; ++j) {
                            var c = exports.Fusion.htmlEncode(row[j].status.toLowerCase());
                            var m = exports.Fusion.htmlEncode(row[j].message);
                            win.document.writeln(indent(3) + "<td class=\"status-" + c + "\">" + m + "</td>");
                        }
                        win.document.writeln(indent(2) + "</tr>");
                    }
                    win.document.writeln(indent(1) + "</tbody>");
                    win.document.writeln("</table>");
                }
                if (root.tree) {
                    win.document.writeln("<ul>");
                    win.document.writeln(indent(1) + "<li>");
                    win.document.writeln(indent(2) + "Selection log:");
                    win.document.writeln(entries2html(root.tree.subEntries, 3));
                    win.document.writeln(indent(1) + "</li>");
                    win.document.writeln("</ul>");
                }
                win.document.writeln("</body></html>");
                win.document.close();
                exports.Fusion.protocol = oldProtocol;
            } else alert("You browser's popup blocker stopped diagnostics window from showing.");
        }
    };

    /**
     * Called when the ads have finished loading.
     */
    exports.Fusion.fireOnAdsLoaded = function(ads, metadata, timestamp) {
        if (exports.Fusion.assertFieldExists("onAdsLoaded")) {
            if (ads !== undefined) {
                for (var placement in ads) {
                    if (!ads.hasOwnProperty(placement)) continue;
                    if (ads[placement] instanceof Array && ads[placement].length > 0) {
                        exports.Fusion.singleSpaceAdIds.push(ads[placement][0].ad);
                    }
                }
            }
            exports.Fusion.onAdsLoaded(ads, timestamp);
            delete exports.Fusion.onAdsLoaded;
        }
        if (typeof metadata != "object") return;
        var handlers = exports.Fusion.adSelectionMetaDataHandlers;
        for (var i in metadata) {
            if (!metadata.hasOwnProperty(i)) continue;
            if (handlers[i] !== undefined) handlers[i](metadata[i]);
        }
    }

    // -- compatibility issues below

    if (typeof(exports.encodeURIComponent) != typeof(function() {})) {
        // Unicode URL encoding for old browsers
        exports.encodeURIComponent = function(s) {
            var unicodeEscapes = [
                "%00", "%01", "%02", "%03", "%04", "%05", "%06", "%07",
                "%08", "%09", "%0A", "%0B", "%0C", "%0D", "%0E", "%0F",
                "%10", "%11", "%12", "%13", "%14", "%15", "%16", "%17",
                "%18", "%19", "%1A", "%1B", "%1C", "%1D", "%1E", "%1F",
                "%20", "!", "%22", "%23", "%24", "%25", "%26", "\'",
                "(", ")", "*", "%2B", "%2C", "-", ".", "%2F",
                "0", "1", "2", "3", "4", "5", "6", "7",
                "8", "9", "%3A", "%3B", "%3C", "%3D", "%3E", "%3F",
                "%40", "A", "B", "C", "D", "E", "F", "G",
                "H", "I", "J", "K", "L", "M", "N", "O",
                "P", "Q", "R", "S", "T", "U", "V", "W",
                "X", "Y", "Z", "%5B", "%5C", "%5D", "%5E", "_",
                "%60", "a", "b", "c", "d", "e", "f", "g",
                "h", "i", "j", "k", "l", "m", "n", "o",
                "p", "q", "r", "s", "t", "u", "v", "w",
                "x", "y", "z", "%7B", "%7C", "%7D", "~", "%7F",
                "%C2%80", "%C2%81", "%C2%82", "%C2%83", "%C2%84", "%C2%85", "%C2%86", "%C2%87",
                "%C2%88", "%C2%89", "%C2%8A", "%C2%8B", "%C2%8C", "%C2%8D", "%C2%8E", "%C2%8F",
                "%C2%90", "%C2%91", "%C2%92", "%C2%93", "%C2%94", "%C2%95", "%C2%96", "%C2%97",
                "%C2%98", "%C2%99", "%C2%9A", "%C2%9B", "%C2%9C", "%C2%9D", "%C2%9E", "%C2%9F",
                "%C2%A0", "%C2%A1", "%C2%A2", "%C2%A3", "%C2%A4", "%C2%A5", "%C2%A6", "%C2%A7",
                "%C2%A8", "%C2%A9", "%C2%AA", "%C2%AB", "%C2%AC", "%C2%AD", "%C2%AE", "%C2%AF",
                "%C2%B0", "%C2%B1", "%C2%B2", "%C2%B3", "%C2%B4", "%C2%B5", "%C2%B6", "%C2%B7",
                "%C2%B8", "%C2%B9", "%C2%BA", "%C2%BB", "%C2%BC", "%C2%BD", "%C2%BE", "%C2%BF",
                "%C3%80", "%C3%81", "%C3%82", "%C3%83", "%C3%84", "%C3%85", "%C3%86", "%C3%87",
                "%C3%88", "%C3%89", "%C3%8A", "%C3%8B", "%C3%8C", "%C3%8D", "%C3%8E", "%C3%8F",
                "%C3%90", "%C3%91", "%C3%92", "%C3%93", "%C3%94", "%C3%95", "%C3%96", "%C3%97",
                "%C3%98", "%C3%99", "%C3%9A", "%C3%9B", "%C3%9C", "%C3%9D", "%C3%9E", "%C3%9F",
                "%C3%A0", "%C3%A1", "%C3%A2", "%C3%A3", "%C3%A4", "%C3%A5", "%C3%A6", "%C3%A7",
                "%C3%A8", "%C3%A9", "%C3%AA", "%C3%AB", "%C3%AC", "%C3%AD", "%C3%AE", "%C3%AF",
                "%C3%B0", "%C3%B1", "%C3%B2", "%C3%B3", "%C3%B4", "%C3%B5", "%C3%B6", "%C3%B7",
                "%C3%B8", "%C3%B9", "%C3%BA", "%C3%BB", "%C3%BC", "%C3%BD", "%C3%BE", "%C3%BF"
            ];
            var ret = "";
            for (var i = 0; i < s.length; ++i)
                ret += unicodeEscapes[s.charCodeAt(i)];
            return ret;
        } // encodeURIComponent
    } // if not encodeURIComponent


    /**
     * Browser detect code
     *
     */

    // Initialize Fusion.Detect namespace
    if (!exports.Fusion.Detect) exports.Fusion.Detect = {};
    if (!exports.Fusion.Detect.values) exports.Fusion.Detect.values = {};
    if (!exports.Fusion.Detect.agent) exports.Fusion.Detect.agent = navigator.userAgent.toLowerCase();
    if (!exports.Fusion.Detect.appVer) exports.Fusion.Detect.appVer = navigator.appVersion.toLowerCase();

    var flashVersion = 10;
    var hasFlashPlayer = false;
    var mediaPlayerVersion = 0;
    var hasWindowsMediaPlayer = false;
    var hasRealPlayerG2 = false;
    var hasRealPlayer4 = false;
    var hasRealPlayer5 = false;
    var hasSilverlight = false;
    var qtPlayerVersion = 0;
    var hasQTPlayer = false;

    exports.Fusion.Detect.doDetect = function() {
        exports.Fusion.Detect.detectUrl();
        exports.Fusion.Detect.detectBrowser();
        exports.Fusion.Detect.detectOS();
        exports.Fusion.Detect.detectPlugins();
        exports.Fusion.Detect.detectResolution();
        exports.Fusion.Detect.detectDateTime();
        exports.Fusion.Detect.getPlugins();
        exports.Fusion.Detect.addToParameters();
    }

    // Add detected values to smarttag call parameters
    exports.Fusion.Detect.addToParameters = function() {
        for (var i in exports.Fusion.Detect.values) {
            if (!exports.Fusion.Detect.values.hasOwnProperty(i)) continue;
            var allValues;
            if (exports.Fusion.Detect.values[i] instanceof Array) {
                allValues = exports.Fusion.Detect.values[i];
            } else {
                allValues = [exports.Fusion.Detect.values[i]];
            }

            for (var j = 0; j < allValues.length; ++j) {
                exports.Fusion.parameters[i] = allValues[j];
            }
        }
    }

    exports.Fusion.Detect.detectUrl = function() {
        exports.Fusion.Detect.values["url"] = exports.location.protocol + "//" + exports.location.host + exports.location.pathname;
        exports.Fusion.Detect.values["url_extra"] = exports.location.search.substr(0, 200);
    }

    exports.Fusion.Detect.detectBrowser = function() {
        exports.Fusion.Detect.BrowserDetect.init();
        exports.Fusion.Detect.values["browserName"] = exports.Fusion.Detect.BrowserDetect.browser;
        exports.Fusion.Detect.values["browserVersion"] = exports.Fusion.Detect.BrowserDetect.version;
        exports.Fusion.Detect.values["browser"] = exports.Fusion.Detect.BrowserDetect.browser + exports.Fusion.Detect.BrowserDetect.version;

    }

    exports.Fusion.Detect.detectOS = function() {
        var isWin = (exports.Fusion.Detect.agent.indexOf('win') != -1);
        var os = "";
        if ((exports.Fusion.Detect.agent.indexOf('nt 4.0') != -1) && isWin) {
            os = "winnt";
        } else if ((exports.Fusion.Detect.agent.indexOf('nt 5.0') != -1) && isWin) {
            os = "win2000";
        } else if ((exports.Fusion.Detect.agent.indexOf('windows nt 6.0') != -1) && isWin) {
            os = "winvista";
        } else if ((exports.Fusion.Detect.agent.indexOf('windows nt 6.1') != -1) && isWin) {
            os = "win7";
        } else if ((exports.Fusion.Detect.agent.indexOf('windows nt 6.2') != -1) && isWin) {
            os = "win8";
        } else if ((exports.Fusion.Detect.agent.indexOf('windows nt 6.3') != -1) && isWin) {
            os = "win8";
        } else if ((exports.Fusion.Detect.agent.indexOf('98') != -1) && isWin) {
            os = "win98";
        } else if ((exports.Fusion.Detect.agent.indexOf('95') != -1) && isWin) {
            os = "win95";
        } else if (exports.Fusion.Detect.agent.indexOf('macintosh') != -1) {
            os = "mac";
        } else if (exports.Fusion.Detect.agent.indexOf('android') != -1) {
            os = "android";
        } else if (exports.Fusion.Detect.agent.indexOf('linux') != -1) {
            os = "linux";
        } else if (exports.Fusion.Detect.agent.indexOf('iphone') != -1) {
            os = "iphone";
        } else if (exports.Fusion.Detect.agent.indexOf('ipad') != -1) {
            os = "ipad";
        } else if ((exports.Fusion.Detect.agent.indexOf('nt') != -1) && (exports.Fusion.Detect.agent.indexOf('5.1') != -1) && isWin) {
            os = "winxp";
        } else if (((exports.Fusion.Detect.agent.indexOf('win 9x 4.90') != -1) || (exports.Fusion.Detect.agent.indexOf('windows me') != -1)) && isWin) {
            os = "winme";
        } else {
            os = "other";
        }
        exports.Fusion.Detect.values["OS"] = os;
    }

    exports.Fusion.Detect.detectResolution = function() {
        var resolution = "";

        if (exports.screen) {
            var height = exports.screen.height;
            var width = exports.screen.width;
            exports.Fusion.Detect.values["screenRes"] = width + "x" + height;
            exports.Fusion.Detect.values["screenWidth"] = width;
            exports.Fusion.Detect.values["screenHeight"] = height;
        } else {
            exports.Fusion.Detect.values["screenRes"] = "n/a";
        }

        //Browser size
        var browserWidth = 0,
            browserHeight = 0;
        if (typeof(exports.innerWidth) == 'number') {
            //Non-IE
            browserWidth = exports.innerWidth;
            browserHeight = exports.innerHeight;
        } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
            //IE 6+ in 'standards compliant mode'
            browserWidth = document.documentElement.clientWidth;
            browserHeight = document.documentElement.clientHeight;
        } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
            //IE 4 compatible
            browserWidth = document.body.clientWidth;
            browserHeight = document.body.clientHeight;
        }
        exports.Fusion.Detect.values["browserWidth"] = browserWidth;
        exports.Fusion.Detect.values["browserHeight"] = browserHeight;
    }

    exports.Fusion.Detect.detectDateTime = function() {
        var date = new Date();
        var dayStrings = new Array("sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday");
        var hours = date.getHours().toString();
        var minutes = date.getMinutes().toString();
        var day = dayStrings[date.getDay()];

        if (hours.length < 2)
            hours = "0" + hours;

        if (minutes.length < 2)
            minutes = "0" + minutes;

        exports.Fusion.Detect.values["time"] = hours + minutes;
        exports.Fusion.Detect.values["weekDay"] = day;
    }

    exports.Fusion.Detect.detectPlugins = function() {
        var flash = deconcept.SWFObject_FusionUtil.getPlayerVersion();
        exports.Fusion.Detect.values["flash"] = flash.major;
    }

    exports.Fusion.Detect.getPlugins = function() {}

    exports.Fusion.Detect.printParameters = function() {
        for (var i in exports.Fusion.Detect.values) {
            if (!exports.Fusion.Detect.values.hasOwnProperty(i)) continue;
            document.write(i + ":" + exports.Fusion.Detect.values[i] + "<br/>")
        }
        document.write(navigator.userAgent + "<br/><br/>");
        document.write(navigator.appVersion + "<br/><br/>");
    }

    exports.Fusion.Detect.BrowserDetect = {
        init: function() {
            this.browser = this.searchString(this.dataBrowser) || "unknown";
            this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "1337";
            this.OS = this.searchString(this.dataOS) || "unknown";
        },
        searchString: function(data) {
            for (var i = 0; i < data.length; i++) {
                var dataString = data[i].string;
                var dataProp = data[i].prop;
                this.versionSearchString = data[i].versionSearch || data[i].identity;
                if (dataString) {
                    if (dataString.indexOf(data[i].subString) != -1)
                        return data[i].identity;
                } else if (dataProp)
                    return data[i].identity;
            }
        },
        searchVersion: function(dataString) {
            var index = dataString.indexOf(this.versionSearchString);
            if (index == -1) return;
            return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
        },
        dataBrowser: [{
                string: navigator.vendor,
                subString: "Opera",
                versionSearch: "OPR",
                identity: "Opera"
            }, {
                string: navigator.userAgent,
                subString: "Chrome",
                versionSearch: "Chrome",
                identity: "Chrome"
            }, {
                string: navigator.userAgent,
                subString: "OmniWeb",
                versionSearch: "OmniWeb/",
                identity: "OmniWeb"
            }, {
                string: navigator.vendor,
                subString: "Apple",
                versionSearch: "Version",
                identity: "Safari"
            }, {
                prop: exports.opera,
                versionSearch: "Version",
                identity: "Opera"
            }, {
                string: navigator.vendor,
                subString: "Opera",
                versionSearch: "Version",
                identity: "Opera"
            },

            {
                prop: exports.opera,
                identity: "Opera"
            }, {
                string: navigator.vendor,
                subString: "iCab",
                identity: "iCab"
            }, {
                string: navigator.vendor,
                subString: "KDE",
                identity: "Konqueror"
            }, {
                string: navigator.userAgent,
                subString: "Firefox",
                identity: "Firefox"
            }, {
                string: navigator.vendor,
                subString: "Camino",
                identity: "Camino"
            }, { // for newer Netscapes (6+)
                string: navigator.userAgent,
                subString: "Netscape",
                identity: "Netscape"
            }, {
                string: navigator.userAgent,
                subString: "MSIE",
                identity: "Explorer",
                versionSearch: "MSIE"
            }, {
                string: navigator.userAgent,
                subString: "Trident",
                identity: "Explorer",
                versionSearch: "rv"
            }, {
                string: navigator.userAgent,
                subString: "Gecko",
                identity: "Mozilla",
                versionSearch: "rv"
            }, { // for older Netscapes (4-)
                string: navigator.userAgent,
                subString: "Mozilla",
                identity: "Netscape",
                versionSearch: "Mozilla"
            }
        ],
        dataOS: [{
            string: navigator.userAgent,
            subString: "Windows NT 6.0",
            identity: "Vista"
        }, {
            string: navigator.platform,
            subString: "Win",
            identity: "Windows"
        }, {
            string: navigator.platform,
            subString: "Mac",
            identity: "Mac"
        }, {
            string: navigator.platform,
            subString: "Linux",
            identity: "Linux"
        }]

    };


    /**
     * SWFObject v1.5: Flash Player detection and embed - http://blog.deconcept.com/swfobject/
     *
     * SWFObject is (c) 2007 Geoff Stearns and is released under the MIT License:
     * http://www.opensource.org/licenses/mit-license.php
     *
     */
    if (typeof deconcept == "undefined") var deconcept = new Object();
    if (typeof deconcept.util == "undefined") deconcept.util = new Object();
    if (typeof deconcept.SWFObject_FusionUtil == "undefined") deconcept.SWFObject_FusionUtil = new Object();
    deconcept.SWFObject_Fusion = function(swf, id, w, h, ver, c, quality, xiRedirectUrl, redirectUrl, detectKey) {
        if (!document.getElementById) {
            return;
        }
        this.DETECT_KEY = detectKey ? detectKey : 'detectflash';
        this.skipDetect = deconcept.util.getRequestParameter(this.DETECT_KEY);
        this.params = new Object();
        this.variables = new Object();
        this.attributes = new Array();
        if (swf) {
            this.setAttribute('swf', swf);
        }
        if (id) {
            this.setAttribute('id', id);
        }
        if (w) {
            this.setAttribute('width', w);
        }
        if (h) {
            this.setAttribute('height', h);
        }
        if (ver) {
            this.setAttribute('version', new deconcept.PlayerVersion(ver.toString().split(".")));
        }
        this.installedVer = deconcept.SWFObject_FusionUtil.getPlayerVersion();
        if (!exports.opera && document.all && this.installedVer.major > 7) {
            // only add the onunload cleanup if the Flash Player version supports External Interface and we are in IE
            deconcept.SWFObject_Fusion.doPrepUnload = true;
        }
        if (c) {
            this.addParam('bgcolor', c);
        }
        var q = quality ? quality : 'high';
        this.addParam('quality', q);
        this.setAttribute('useExpressInstall', false);
        this.setAttribute('doExpressInstall', false);
        var xir = (xiRedirectUrl) ? xiRedirectUrl : exports.location;
        this.setAttribute('xiRedirectUrl', xir);
        this.setAttribute('redirectUrl', '');
        if (redirectUrl) {
            this.setAttribute('redirectUrl', redirectUrl);
        }
    }
    deconcept.SWFObject_Fusion.prototype = {
        useExpressInstall: function(path) {
            this.xiSWFPath = !path ? "expressinstall.swf" : path;
            this.setAttribute('useExpressInstall', true);
        },
        setAttribute: function(name, value) {
            this.attributes[name] = value;
        },
        getAttribute: function(name) {
            return this.attributes[name];
        },
        addParam: function(name, value) {
            this.params[name] = value;
        },
        getParams: function() {
            return this.params;
        },
        addVariable: function(name, value) {
            this.variables[name] = value;
        },
        getVariable: function(name) {
            return this.variables[name];
        },
        getVariables: function() {
            return this.variables;
        },
        getVariablePairs: function() {
            var variablePairs = new Array();
            var key;
            var variables = this.getVariables();
            for (key in variables) {
                if (!variables.hasOwnProperty(key)) continue;
                variablePairs[variablePairs.length] = key + "=" + variables[key];
            }
            return variablePairs;
        },
        getSWFHTML: function() {
            var swfNode = "";
            if (navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length) { // netscape plugin architecture
                if (this.getAttribute("doExpressInstall")) {
                    this.addVariable("MMplayerType", "PlugIn");
                    this.setAttribute('swf', this.xiSWFPath);
                }
                swfNode = '<embed type="application/x-shockwave-flash" src="' + this.getAttribute('swf') + '" width="' + this.getAttribute('width') + '" height="' + this.getAttribute('height') + '" style="' + this.getAttribute('style') + '"';
                swfNode += ' id="' + this.getAttribute('id') + '" name="' + this.getAttribute('id') + '" ';
                var params = this.getParams();
                for (var key in params) {
                    if (params.hasOwnProperty(key)) swfNode += [key] + '="' + params[key] + '" ';
                }
                var pairs = this.getVariablePairs().join("&");
                if (pairs.length > 0) {
                    swfNode += 'flashvars="' + pairs + '"';
                }
                swfNode += '/>';
            } else { // PC IE
                if (this.getAttribute("doExpressInstall")) {
                    this.addVariable("MMplayerType", "ActiveX");
                    this.setAttribute('swf', this.xiSWFPath);
                }
                swfNode = '<object id="' + this.getAttribute('id') + '" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="' + this.getAttribute('width') + '" height="' + this.getAttribute('height') + '" style="' + this.getAttribute('style') + '">';
                swfNode += '<param name="movie" value="' + this.getAttribute('swf') + '" />';
                var params = this.getParams();
                for (var key in params) {
                    if (!params.hasOwnProperty(key)) continue;
                    swfNode += '<param name="' + key + '" value="' + params[key] + '" />';
                }
                var pairs = this.getVariablePairs().join("&");
                if (pairs.length > 0) {
                    swfNode += '<param name="flashvars" value="' + pairs + '" />';
                }
                swfNode += "</object>";
            }
            return swfNode;
        },
        write: function(elementId) {
            if (this.getAttribute('useExpressInstall')) {
                // check to see if we need to do an express install
                var expressInstallReqVer = new deconcept.PlayerVersion([6, 0, 65]);
                if (this.installedVer.versionIsValid(expressInstallReqVer) && !this.installedVer.versionIsValid(this.getAttribute('version'))) {
                    this.setAttribute('doExpressInstall', true);
                    this.addVariable("MMredirectURL", escape(this.getAttribute('xiRedirectUrl')));
                    document.title = document.title.slice(0, 47) + " - Flash Player Installation";
                    this.addVariable("MMdoctitle", document.title);
                }
            }
            if (this.skipDetect || this.getAttribute('doExpressInstall') || this.installedVer.versionIsValid(this.getAttribute('version'))) {
                var n = (typeof elementId == 'string') ? document.getElementById(elementId) : elementId;
                n.innerHTML = this.getSWFHTML();
                return true;
            } else {
                if (this.getAttribute('redirectUrl') != "") {
                    document.location.replace(this.getAttribute('redirectUrl'));
                }
            }
            return false;
        }
    }

    /* ---- detection functions ---- */
    deconcept.SWFObject_FusionUtil.getPlayerVersion = function() {
        var PlayerVersion = new deconcept.PlayerVersion([0, 0, 0]);
        if (navigator.plugins && navigator.mimeTypes.length) {
            var x = navigator.plugins["Shockwave Flash"];
            if (x && x.description) {
                PlayerVersion = new deconcept.PlayerVersion(x.description.replace(/([a-zA-Z]|\s)+/, "").replace(/(\s+r|\s+b[0-9]+)/, ".").split("."));
            }
        } else if (navigator.userAgent && navigator.userAgent.indexOf("Windows CE") >= 0) { // if Windows CE
            var axo = 1;
            var counter = 3;
            while (axo) {
                try {
                    counter++;
                    axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash." + counter);
                    //				document.write("player v: "+ counter);
                    PlayerVersion = new deconcept.PlayerVersion([counter, 0, 0]);
                } catch (e) {
                    axo = null;
                }
            }
        } else { // Win IE (non mobile)
            // do minor version lookup in IE, but avoid fp6 crashing issues
            // see http://blog.deconcept.com/2006/01/11/getvariable-setvariable-crash-internet-explorer-flash-6/
            try {
                var axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
            } catch (e) {
                try {
                    var axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
                    PlayerVersion = new deconcept.PlayerVersion([6, 0, 21]);
                    axo.AllowScriptAccess = "always"; // error if player version < 6.0.47 (thanks to Michael Williams @ Adobe for this code)
                } catch (e) {
                    if (PlayerVersion.major == 6) {
                        return PlayerVersion;
                    }
                }
                try {
                    axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
                } catch (e) {}
            }
            if (axo !== null && axo !== undefined) {
                PlayerVersion = new deconcept.PlayerVersion(axo.GetVariable("$version").split(" ")[1].split(","));
            }
        }
        return PlayerVersion;
    }
    deconcept.PlayerVersion = function(arrVersion) {
        this.major = arrVersion[0] != null ? parseInt(arrVersion[0]) : 0;
        this.minor = arrVersion[1] != null ? parseInt(arrVersion[1]) : 0;
        this.rev = arrVersion[2] != null ? parseInt(arrVersion[2]) : 0;
    }
    deconcept.PlayerVersion.prototype.versionIsValid = function(fv) {
        if (this.major < fv.major) return false;
        if (this.major > fv.major) return true;
        if (this.minor < fv.minor) return false;
        if (this.minor > fv.minor) return true;
        if (this.rev < fv.rev) return false;
        return true;
    }
    /* ---- get value of query string param ---- */
    deconcept.util = {
        getRequestParameter: function(param) {
            var q = document.location.search || document.location.hash;
            if (param == null) {
                return q;
            }
            if (q) {
                var pairs = q.substring(1).split("&");
                for (var i = 0; i < pairs.length; i++) {
                    if (pairs[i].substring(0, pairs[i].indexOf("=")) == param) {
                        return pairs[i].substring((pairs[i].indexOf("=") + 1));
                    }
                }
            }
            return "";
        }
    }
    /* fix for video streaming bug */
    deconcept.SWFObject_FusionUtil.cleanupSWFs = function() {
        var objects = document.getElementsByTagName("OBJECT");
        for (var i = objects.length - 1; i >= 0; i--) {
            objects[i].style.display = 'none';
            for (var x in objects[i]) {
                if (objects[i].hasOwnProperty(i) && typeof objects[i][x] == 'function') {
                    objects[i][x] = function() {};
                }
            }
        }
    }
    // fixes bug in some fp9 versions see http://blog.deconcept.com/2006/07/28/swfobject-143-released/
    if (deconcept.SWFObject_Fusion.doPrepUnload) {
        if (!deconcept.unloadSet) {
            deconcept.SWFObject_FusionUtil.prepUnload = function() {
                __flash_unloadHandler = function() {};
                __flash_savedUnloadHandler = function() {};
                exports.attachEvent("onunload", deconcept.SWFObject_FusionUtil.cleanupSWFs);
            }
            exports.attachEvent("onbeforeunload", deconcept.SWFObject_FusionUtil.prepUnload);
            deconcept.unloadSet = true;
        }
    }
    // add document.getElementById if needed (mobile IE < 5) 
    if (!document.getElementById && document.all) {
        document.getElementById = function(id) {
            return document.all[id];
        }
    }

    // add some aliases for ease of use/backwards compatibility
    var SWFObject_Fusion = deconcept.SWFObject_Fusion;

    exports.Fusion.Detect.doDetect();

    // Run Fusion initiation hooks
    (function() {
        if (exports.Fusion.initiationHooks !== undefined) {
            while (exports.Fusion.initiationHooks.length > 0)
                exports.Fusion.initiationHooks.shift()();
            delete exports.Fusion.initiationHooks;
        }
    })();
})(typeof exports === 'undefined' ? this : exports);