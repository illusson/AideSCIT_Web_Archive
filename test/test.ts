import {SharedPreferences} from "../js/core/SharedPreferences";

window.onload = function() {
    SharedPreferences.getInterface("user").edit()
        .putNumber('test_number', 2)
        .putString('test_string', "1")
        .putBoolean('test_boolean', false)
        .apply();
    const sp = SharedPreferences.getInterface("user");
    document.getElementById("content").textContent = sp
        .getNumber("test_number", 0)
        .toString();
}