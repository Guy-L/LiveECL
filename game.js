function getParent(){
  return opener == null ? parent : opener;
}

window.onunload = function() {
    if (opener != null && !opener.closed) {
        opener.gameRestore();
    }
};