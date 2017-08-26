var mainTreeViewController = function($scope, $element, $timeout, columnsService, treeService, mainTreeService, mainTreeElementService, nodeSelectionService, treeColumnService, hotkeyService, hotkeyFactory, contextMenuFactory) {
    // link view to scope
    let data = $scope.$parent.tab.data;
    data.scope = $scope;

    // helper variables
    let hotkeys = hotkeyFactory.mainTreeHotkeys(),
        openableTypes = [xelib.etMainRecord, xelib.etFile];
    $scope.allColumns = columnsService.columns;
    $scope.nodeContextMenuItems = contextMenuFactory.mainTreeItems;

    // inherited functions
    treeService.buildFunctions($scope, $element);
    mainTreeService.buildFunctions($scope);
    mainTreeElementService.buildFunctions($scope);
    nodeSelectionService.buildFunctions($scope);
    treeColumnService.buildFunctions($scope, '.main-tree-view', true);
    hotkeyService.buildOnKeyDown($scope, 'onTreeKeyDown', hotkeys);

    // scope functions
    $scope.toggleRefactorModal = function(visible, mode) {
        $scope.showRefactorModal = visible;
        $scope.refactorMode = mode;
    };

    $scope.open = function(node) {
        if (!openableTypes.contains(node.element_type)) return;
        if (data.linkedScope) {
            // get a new handle for the record to be used with the record view
            let path = node.element_type === xelib.etFile ? 'File Header' : '';
            data.linkedScope.record = xelib.GetElement(node.handle, path);
        }
    };

    $scope.onNodeDoubleClick = function(e, node) {
        if (e.srcElement && e.srcElement.classList.contains('expand-node')) return;
        if (node.can_expand) $scope.toggleNode(null, node);
        $scope.open(node);
    };

    $scope.onNodeDrag = function(node) {
        if (node.element_type === xelib.etGroupRecord) return;
        $scope.$root.dragData = {
            source: 'mainTreeView',
            node: node
        };
        return true;
    };

    $scope.handleEnter = function(e) {
        $scope.open($scope.lastSelectedNode());
        e.stopImmediatePropagation();
    };

    $scope.handleDelete = function(e) {
        $scope.selectedNodes.forEach((node) => $scope.deleteElement(node));
        e.stopImmediatePropagation();
    };

    // event handling
    $scope.$on('recordUpdated', (e, element) => {
        let node = $scope.getNodeForElement(element);
        if (node) {
            $scope.rebuildNode(node);
            $scope.setNodeModified(node);
        } else {
            $scope.setParentsModified(element);
        }
    });
    $scope.$on('nodeUpdated', (e, node) => {
        $scope.rebuildNode(node);
        $scope.setNodeModified(node);
    });

    // initialization
    $scope.sort = { column: 'FormID', reverse: false };
    $scope.buildColumns();
    $scope.buildTree();
    $timeout($scope.resolveElements, 100);
};