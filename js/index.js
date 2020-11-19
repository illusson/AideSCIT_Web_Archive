"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onDrawerListItemClick = void 0;
function onDrawerListItemClick(index) {
    var active_list = document.getElementsByClassName("mdui-list-item-active");
    for (var active_index = 0; active_index < active_list.length; active_index++) {
        var active_item = active_list.item(active_index);
        active_item.classList.remove("mdui-list-item-active");
    }
    var drawer_list = document.getElementsByClassName("drawer-list");
    drawer_list.item(index).classList.add("mdui-list-item-active");
}
exports.onDrawerListItemClick = onDrawerListItemClick;
//# sourceMappingURL=index.js.map