var recordTreeViewController = function($scope, $element, $timeout, htmlHelpers, stylesheetService, treeService, recordTreeService, nodeSelectionService, treeColumnService) {
    // link view to scope
    let data = $scope.$parent.tab.data;
    data.scope = $scope;

    // helper variables
    let overrides = [];

    // inherited functions
    treeService.buildFunctions($scope, $element);
    recordTreeService.buildFunctions($scope);
    nodeSelectionService.buildFunctions($scope);
    treeColumnService.buildFunctions($scope, '.record-tree-view', false, true);

    // helper functions
    let getRecordFileName = function(record) {
        let fileName = '';
        xelib.WithHandle(xelib.GetElementFile(record), function(file) {
            fileName = xelib.DisplayName(file);
        });
        return fileName;
    };

    // scope functions
    $scope.buildColumns = function() {
        $scope.columns = [{
            label: 'Element Name',
            width: '250px'
        },{
            label: getRecordFileName($scope.record),
            handle: $scope.record,
            width: '300px'
        }];
        xelib.GetOverrides($scope.record).forEach(function(override) {
            $scope.columns.push({
                label: getRecordFileName(override),
                handle: override,
                width: '300px'
            })
        });
        $scope.resizeColumns();
    };

    $scope.buildTree = function() {
        let names = xelib.GetDefNames($scope.record);
        let handles = $scope.columns.map((column) => { return column.handle; });
        $scope.virtualNodes = xelib.GetNodes($scope.record);
        $scope.tree = $scope.buildStructNodes(handles.slice(1), -1, names);
    };

    // TODO: $scope.resolveNode
    // TODO: $scope.navigateToElement

    $scope.focusAddressInput = function () {
        let addressInput = htmlHelpers.resolveElement($scope.tabView, 'record-address-bar/input');
        if (addressInput) addressInput.focus();
    };

    $scope.toggleAddressBar = function(visible) {
        $scope.showAddressBar = visible;
        if (visible) {
            $timeout($scope.focusAddressInput, 50);
        } else {
            $scope.treeElement.focus();
        }
    };

    $scope.handleEnter = function(e) {
        // TODO
        e.stopPropagation();
    };

    $scope.onScroll = function(e) {
        $scope.columnsElement.scrollLeft = e.currentTarget.scrollLeft;
    };

    // event handling
    $scope.$on('setRecord', function(e, record) {
        $scope.record = record;
        e.stopPropagation();
    });

    // initialization
    $scope.$watch('record', function(newValue, oldValue) {
        if (oldValue == newValue) return;
        if (oldValue) {
            xelib.Release(oldValue);
            xelib.ReleaseNodes($scope.virtualNodes);
        }
        overrides.forEach(xelib.Release);
        overrides = [];
        if (!$scope.record) return;
        if (!xelib.IsMaster($scope.record)) {
            $scope.record = xelib.GetMaster($scope.record);
        } else {
            $scope.buildColumns();
            $scope.buildTree();
            $scope.$broadcast('recordChanged');
        }
        $timeout($scope.resolveElements, 100);
    });

    $scope.showAddressBar = true;
    $scope.autoExpand = true;
    $timeout($scope.linkToMainTreeView, 100);
};