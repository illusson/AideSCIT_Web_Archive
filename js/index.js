"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCache = exports.onDrawerListItemClick = void 0;
var DrawerController = /** @class */ (function () {
    function DrawerController() {
    }
    DrawerController.index_now = -1;
    return DrawerController;
}());
function onDrawerListItemClick(index) {
    var active_list = document.getElementsByClassName("mdui-list-item-active");
    for (var active_index = 0; active_index < active_list.length; active_index++) {
        var active_item = active_list.item(active_index);
        active_item.classList.remove("mdui-list-item-active");
    }
    var drawer_list = document.getElementsByClassName("drawer-list");
    var active = drawer_list.item(index);
    if (index == 4) {
        active = drawer_list.item(5);
    }
    active.classList.add("mdui-list-item-active");
    if (index != DrawerController.index_now) {
        var page_list = document.getElementsByClassName("index-page");
        for (var active_index = 0; active_index < page_list.length; active_index++) {
            var active_item_1 = page_list.item(active_index);
            active_item_1.setAttribute("style", "display: none;");
        }
        var active_item = page_list.item(index);
        if (active_item.hasAttribute("style")) {
            active_item.removeAttribute("style");
        }
    }
    DrawerController.index_now = index;
}
exports.onDrawerListItemClick = onDrawerListItemClick;
window.onload = function () {
    onDrawerListItemClick(3);
};
function clearCache() {
    localStorage.clear();
}
exports.clearCache = clearCache;
//# sourceMappingURL=index.js.map