export function onDrawerListItemClick(index: number){
    const active_list: HTMLCollectionOf<Element> = document.getElementsByClassName("mdui-list-item-active");
    for (let active_index = 0; active_index < active_list.length; active_index++){
        const active_item: Element = active_list.item(active_index);
        active_item.classList.remove("mdui-list-item-active");
    }
    const drawer_list: HTMLCollectionOf<Element> = document.getElementsByClassName("drawer-list");
    drawer_list.item(index).classList.add("mdui-list-item-active");
}