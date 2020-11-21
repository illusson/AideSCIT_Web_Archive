class DrawerController {
    public static index_now = -1;
}

export function onDrawerListItemClick(index: number){
    if (index == 4){
        window.open("http://218.6.163.95:8081/");
    } else {
        const active_list: HTMLCollectionOf<Element> = document.getElementsByClassName("mdui-list-item-active");
        for (let active_index = 0; active_index < active_list.length; active_index++){
            const active_item: Element = active_list.item(active_index);
            active_item.classList.remove("mdui-list-item-active");
        }
        const drawer_list: HTMLCollectionOf<Element> = document.getElementsByClassName("drawer-list");
        drawer_list.item(index).classList.add("mdui-list-item-active");
    }
    if (index != DrawerController.index_now) {
        const page_list: HTMLCollectionOf<Element> = document.getElementsByClassName("index-page");
        for (let active_index = 0; active_index < page_list.length; active_index++){
            const active_item: Element = page_list.item(active_index);
            active_item.setAttribute("style", "display: none;")
        }
        const active_item = page_list.item(index);
        if (active_item.hasAttribute("style")) {
            active_item.removeAttribute("style");
        }
    }
    DrawerController.index_now = index;
}

window.onload = function (){
    onDrawerListItemClick(0);
}