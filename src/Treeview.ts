// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// ----------------------------------------------------------------------------

// tslint:disable:no-var-keyword // Grandfathered in
// tslint:disable:no-duplicate-variable // Grandfathered in

import { ContextTagKeys } from "applicationinsights/out/Declarations/Contracts";
import * as assert from "assert";
import * as vscode from "vscode";
import { TreeItem } from "vscode";
import * as Json from "./JSON";
import { isLanguageIdSupported } from "./supported";
import { Parser } from "./TLE";
import * as Utilities from "./Utilities";

const topLevelIcons: [string, string][] = [
    ["$schema", "label.svg"],
    ["version", "label.svg"],
    ["contentVersion", "label.svg"],
    ["handler", "label.svg"],
    ["parameters", "parameters.svg"],
    ["variables", "variables.svg"],
    ["resources", "Microsoft.Resources.subscriptions.resourceGroups.svg"],
    ["outputs", "outputs.svg"],
    ["functions", "function.svg"],
];

const topLevelChildIconsByRootNode: [string, string][] = [
    ["parameters", "parameters.svg"],
    ["variables", "variables.svg"],
    ["outputs", "outputs.svg"],
    ["tags", "tags.svg"],
    ["functions", "function.svg"],
];

const resourceTypeIcons: [string, string][] = [
    ["Microsoft.ApiManagement/service", "Microsoft.ApiManagement.service.svg"],
    ["Microsoft.Automation/AutomationAccounts", "Microsoft.Automation.AutomationAccounts.svg"],
    ["Microsoft.Cache/Redis", "Microsoft.Cache.Redis.svg"],
    ["Microsoft.Batch/batchAccounts", "Microsoft.Batch.batchAccounts.svg"],
    ["microsoft.cdn/profiles", "microsoft.cdn.profiles.svg"],
    ["microsoft.cdn/profiles/endpoints", "microsoft.cdn.profiles.svg"],
    ["Microsoft.Compute/availabilitySets", "Microsoft.Compute.availabilitySets.svg"],
    ["Microsoft.Compute/disks", "Microsoft.Compute.disks.svg"],
    ["Microsoft.Compute/images", "Microsoft.Compute.images.svg"],
    ["Microsoft.Compute/virtualMachines/extensions", "Microsoft.Compute.virtualMachines.extensions.svg"],
    ["Microsoft.Compute/virtualMachines", "Microsoft.Compute.virtualMachines.svg"],
    ["Microsoft.Compute/virtualMachineScaleSets", "Microsoft.Compute.virtualMachineScaleSets.svg"],
    ["Microsoft.ContainerRegistry/registries", "Microsoft.ContainerRegistry.registries.svg"],
    ["Microsoft.ContainerService/containerGroups", "Microsoft.ContainerService.containerGroups.svg"],
    ["Microsoft.ContainerService/containerServices", "Microsoft.ContainerService.containerServices.svg"],
    ["Microsoft.ContainerService/managedClusters", "Microsoft.ContainerService.managedClusters.svg"],
    ["Microsoft.DataCatalog", "Microsoft.DataCatalog.svg"],
    ["Microsoft.DataFactory", "Microsoft.DataFactory.svg"],
    ["Microsoft.DevTestLab/labs", "Microsoft.DevTestLab.labs.svg"],
    ["Microsoft.DocumentDb/databaseAccounts", "Microsoft.DocumentDb.databaseAccounts.svg"],
    ["Microsoft.EventHub/namespaces", "Microsoft.EventHub.namespaces.svg"],
    ["Microsoft.insights/components", "microsoft.insights.components.svg"],
    ["Microsoft.KeyVault/vaults", "Microsoft.KeyVault.vaults.svg"],
    ["Microsoft.Logic/workflows", "Microsoft.Logic.workflows.svg"],
    ["Microsoft.Network/applicationGateways", "Microsoft.Network.applicationGateways.svg"],
    ["Microsoft.Network/connections", "Microsoft.Network.connections.svg"],
    ["Microsoft.Network/dnsZones", "Microsoft.Network.dnsZones.svg"],
    ["Microsoft.Network/expressRouteCircuits", "Microsoft.Network.expressRouteCircuits.svg"],
    ["Microsoft.Network/LoadBalancers", "Microsoft.Network.LoadBalancers.svg"],
    ["Microsoft.Network/localnetworkgateways", "Microsoft.Network.localnetworkgateways.svg"],
    ["Microsoft.Network/networkInterfaces", "Microsoft.Network.networkInterfaces.svg"],
    ["Microsoft.Network/networkSecurityGroups", "Microsoft.Network.networkSecurityGroups.svg"],
    ["Microsoft.Network/publicIPAddresses", "Microsoft.Network.publicIPAddresses.svg"],
    ["Microsoft.Network/routeFilters", "Microsoft.Network.routeFilters.svg"],
    ["Microsoft.Network/routeTables", "Microsoft.Network.routeTables.svg"],
    ["Microsoft.Network/trafficManagerProfiles/azureEndpoints", "Microsoft.Network.trafficmanagerprofiles.svg"],
    ["Microsoft.Network/trafficmanagerprofiles", "Microsoft.Network.trafficmanagerprofiles.svg"],
    ["Microsoft.Network/virtualNetworkGateways", "Microsoft.Network.virtualNetworkGateways.svg"],
    ["Microsoft.Network/virtualNetworks", "Microsoft.Network.virtualNetworks.svg"],
    ["Microsoft.NotificationHubs/namespaces", "Microsoft.NotificationHubs.namespaces.svg"],
    ["Microsoft.RecoveryServices/vaults", "Microsoft.RecoveryServices.vaults.svg"],
    ["Microsoft.Resources/subscriptions/resourceGroups", "Microsoft.Resources.subscriptions.resourceGroups.svg"],
    ["Microsoft.Search/searchServices", "Microsoft.Search.searchServices.svg"],
    ["Microsoft.ServiceBus/namespaces", "Microsoft.ServiceBus.namespaces.svg"],
    ["Microsoft.ServiceFabric/clusters", "Microsoft.ServiceFabric.clusters.svg"],
    ["Microsoft.ServiceFabricMesh/applications", "Microsoft.ServiceFabricMesh.applications.svg"],
    ["Microsoft.Sql/managedInstances/databases", "Microsoft.Sql.managedInstances.databases.svg"],
    ["Microsoft.Sql/managedInstances", "Microsoft.Sql.managedInstances.svg"],
    ["Microsoft.Sql.servers/elasticpools", "Microsoft.Sql.elasticpools.svg"],
    ["Microsoft.Sql.servers/servers", "Microsoft.Sql.servers.svg"],
    ["Microsoft.Sql.servers/databases/servers", "Microsoft.Sql.servers.databases.svg"],
    ["Microsoft.Storage/storageAccounts", "Microsoft.Storage.storageAccounts.svg"],
    ["Microsoft.Web/HostingEnvironments/workerPools", "Microsoft.Web.HostingEnvironments.workerPools.svg"],
    ["Microsoft.Web/HostingEnvironments", "Microsoft.Web.HostingEnvironments.svg"],
    ["Microsoft.Web/sites", "Microsoft.Web.Sites.svg"],
    ["Microsoft.Web/serverfarms", "Microsoft.Web.serverfarms.svg"],
];

const resourceChildIcons: [string, string][] = [
    ["parameters", "parameters.svg"],
    ["variables", "variables.svg"],
    ["outputs", "outputs.svg"],
    ["tags", "tags.svg"],
    ["functions", "function.svg"],
];

const functionIcons: [string, string][] = [
    //Array and object functions
    ["array", "function.svg"],
    ["coalesce", "function.svg"],
    ["concat", "function.svg"],
    ["contains", "function.svg"],
    ["createArray", "function.svg"],
    ["empty", "function.svg"],
    ["first", "function.svg"],
    ["intersection", "function.svg"],
    ["json", "function.svg"],
    ["last", "function.svg"],
    ["length", "function.svg"],
    ["min", "function.svg"],
    ["max", "function.svg"],
    ["range", "function.svg"],
    ["skip", "function.svg"],
    ["take", "function.svg"],
    ["union", "function.svg"],
    //Comparison functions
    ["equals", "function.svg"],
    ["less", "function.svg"],
    ["lessOrEquals", "function.svg"],
    ["greater", "function.svg"],
    ["greaterOrEquals", "function.svg"],
    //Logical functions
    ["and", "function.svg"],
    ["bool", "function.svg"],
    ["if", "function.svg"],
    ["not", "function.svg"],
    ["or", "function.svg"],
    // Resource functions
    ["listAccountSas", "function.svg"],
    ["listKeys", "function.svg"],
    ["listSecrets", "function.svg"],
    ["list*", "function.svg"],
    ["providers", "function.svg"],
    ["reference", "function.svg"],
    ["resourceGroup", "function.svg"],
    ["resourceId", "function.svg"],
    ["subscription", "function.svg"],
    // String functions
    ["base64", "function.svg"],
    ["base64ToJson", "function.svg"],
    ["base64ToString", "function.svg"],
    ["concat", "function.svg"],
    ["contains", "function.svg"],
    ["dataUri", "function.svg"],
    ["dataUriToString", "function.svg"],
    ["empty", "function.svg"],
    ["endsWith", "function.svg"],
    ["first", "function.svg"],
    ["guid", "function.svg"],
    ["indexOf", "function.svg"],
    ["last", "function.svg"],
    ["lastIndexOf", "function.svg"],
    ["length", "function.svg"],
    ["padLeft", "function.svg"],
    ["replace", "function.svg"],
    ["skip", "function.svg"],
    ["split", "function.svg"],
    ["startsWith", "function.svg"],
    ["string", "function.svg"],
    ["substring", "function.svg"],
    ["take", "function.svg"],
    ["toLower", "function.svg"],
    ["toUpper", "function.svg"],
    ["trim", "function.svg"],
    ["uniqueString", "function.svg"],
    ["uri", "function.svg"],
    ["uriComponent", "function.svg"],
    ["uriComponentToString", "function.svg"]
];

export class JsonOutlineProvider implements vscode.TreeDataProvider<string> {
    private tree: Json.ParseResult;
    private text: string;
    private editor: vscode.TextEditor;

    public readonly onDidChangeTreeDataEmitter: vscode.EventEmitter<string | null> =
        new vscode.EventEmitter<string | null>();
    public readonly onDidChangeTreeData: vscode.Event<string | null> = this.onDidChangeTreeDataEmitter.event;

    constructor(private context: vscode.ExtensionContext) {
        context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => this.updateTreeState()));
        context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(() => this.updateTreeState()));

        setTimeout(
            () => {
                // In case there is already a document opened before the extension gets loaded.
                this.updateTreeState();
            },
            500);
    }

    // tslint:disable-next-line:no-any
    public static addItemCommand(item: vscode.TreeItem, commandName: string, args?: any[]): vscode.TreeItem {
        item.command = {
            arguments: args,
            command: commandName,
            title: "",
        };

        return item;
    }

    public static addItemIcon(node: vscode.TreeItem, key: string, visibility: string = "public") {
        const aliases = {
            function: "method",
            variable: "property",
        };

        if (aliases[key] !== undefined) {
            key = aliases[key];
        }

        return node;
    }

    public refresh() {
        this.onDidChangeTreeDataEmitter.fire(void 0);
    }

    public getChildren(element?: string): string[] {
        // check if there is a visible text editor
        if (vscode.window.visibleTextEditors.length > 0) {
            if (isLanguageIdSupported(vscode.window.activeTextEditor.document.languageId)) {

                if (!this.tree) {
                    this.refresh();
                    assert(this.tree, "No tree");
                }

                let result = [];
                if (!element) {
                    if (this.tree.value instanceof Json.ObjectValue) {
                        for (let i = 0, il = this.tree.value.properties.length; i < il; i++) {
                            let item = this.getElementInfo(this.tree.value.properties[i]);
                            result.push(item);
                        }
                    }
                } else {
                    let elementInfo = <IElementInfo>JSON.parse(element);
                    assert(!!elementInfo.current, "elementInfo.current not defined");
                    let valueNode = this.tree.getValueAtCharacterIndex(elementInfo.current.value.start);

                    // Value is an object and is collapsible
                    if (valueNode instanceof Json.ObjectValue && elementInfo.current.collapsible) {

                        for (let i = 0, il = valueNode.properties.length; i < il; i++) {
                            let item = this.getElementInfo(valueNode.properties[i], elementInfo);
                            result.push(item);

                        }
                    } else if (valueNode instanceof Json.ArrayValue && elementInfo.current.collapsible) {
                        // Array with objects
                        for (let i = 0, il = valueNode.length; i < il; i++) {
                            let valueElement = valueNode.elements[i];
                            if (valueElement instanceof Json.ObjectValue) {
                                let item = this.getElementInfo(valueElement, elementInfo);
                                result.push(item);
                            }
                        }
                    }
                }
                return result;
            }
        }
    }

    public getTreeItem(element: string): vscode.TreeItem {

        const elementInfo: IElementInfo = JSON.parse(element);
        const start = vscode.window.activeTextEditor.document.positionAt(elementInfo.current.key.start);
        const end = vscode.window.activeTextEditor.document.positionAt(elementInfo.current.value.end);

        let treeItem: vscode.TreeItem = {
            label: this.getTreeNodeLabel(elementInfo),
            collapsibleState: elementInfo.current.collapsible ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
            iconPath: this.getIconPath(elementInfo),
            command: {
                arguments: [new vscode.Range(start, end)],
                command: "extension.treeview.goto",
                title: "",
            }
        };
        return treeItem;
    }

    public goToDefinition(range: vscode.Range) {
        const editor: vscode.TextEditor = vscode.window.activeTextEditor;

        // tslint:disable-next-line:no-console
        console.log("hello");
        // Center the method in the document
        editor.revealRange(range, vscode.TextEditorRevealType.Default);
        // Select the method name
        editor.selection = new vscode.Selection(range.start, range.end);
        // Swap the focus to the editor
        vscode.window.showTextDocument(editor.document, editor.viewColumn, false);
    }

    public rename(offset: number): void {
        vscode.window.showInputBox({ placeHolder: 'Enter the new label' })
            .then(value => {
                if (value !== null && value !== undefined) {
                    // this.editor.edit(editBuilder => {
                    //     const path = json.getLocation(this.text, offset).path;
                    //     let propertyNode = json.findNodeAtLocation(this.tree, path);
                    //     if (propertyNode.parent.type !== 'array') {
                    //         propertyNode = propertyNode.parent.children[0];
                    //     }
                    //     const range = new vscode.Range(this.editor.document.positionAt(propertyNode.offset), this.editor.document.positionAt(propertyNode.offset + propertyNode.length));
                    //     editBuilder.replace(range, `"${value}"`);
                    //     setTimeout(() => {
                    //         this.parseTree();
                    //         this.refresh(offset);
                    //     },         100);
                    // });
                }
            });
    }

    private parseTree(document?: vscode.TextDocument): void {
        if (!!document && isLanguageIdSupported(document.languageId)) {
            this.text = document.getText();
            this.tree = Json.parse(this.text);
        }
    }

    private getTreeNodeLabel(elementInfo: IElementInfo): string {
        const keyNode = this.tree.getValueAtCharacterIndex(elementInfo.current.key.start);

        // Key is an object (e.g. a resource object)
        if (keyNode instanceof Json.ObjectValue) {
            let foundName = false;
            // Object contains no elements
            if (keyNode.properties.length === 0) {
                return "{}";
            } else {
                // Object contains elements, look for displayName tag first
                let tags = keyNode.properties.find(p => p.name && p.name.toString().toLowerCase() === 'tags');
                if (tags && tags.value instanceof Json.ObjectValue) {
                    let displayNameProp = tags.value.properties.find(p => p.name && p.name.toString().toLowerCase() === 'displayname');
                    if (displayNameProp) {
                        let displayName = displayNameProp.value && displayNameProp.value.toString();
                        if (displayName) {
                            return displayName;
                        }
                    }
                }

                // Look for name element
                for (var i = 0, l = keyNode.properties.length; i < l; i++) {
                    let props = keyNode.properties[i];
                    // If name element is found
                    if (props.name instanceof Json.StringValue && props.name.toString().toUpperCase() === "name".toUpperCase()) {
                        let name = props.value.toFriendlyString();
                        return shortenTreeLabel(name);
                    }
                }

                // Object contains elements, but not a name element
                if (!foundName) {
                    return "{...}";
                }
            }

        } else if (elementInfo.current.value.kind === Json.ValueKind.ArrayValue || elementInfo.current.value.kind === Json.ValueKind.ObjectValue) {
            // The value of the node is an array or object (e.g. properties or resources) - return key as the node label
            return keyNode.toFriendlyString();
        } else {
            // For other value types, display key and value since they won't be expandable
            const valueNode = this.tree.getValueAtCharacterIndex(elementInfo.current.value.start);
            return `${keyNode instanceof Json.StringValue ? keyNode.toFriendlyString() : "?"}: ${valueNode.toFriendlyString()}`;
        }
    }

    /**
     * Returns an IElementInfo that describes either an array element or an object element (a property)
     */
    private getElementInfo(childElement: Json.Property | Json.ObjectValue, elementInfo?: IElementInfo) {
        let collapsible = false;

        // Is childElement an Object (thus an array element, e.g. a top-level element of "resources")
        if (childElement instanceof Json.ObjectValue) {
            if (childElement.properties.length > 0) {
                collapsible = true;
            }
        } else {
            // Otherwise we're looking at a property (i.e., an object element)

            // Is it a property with an Array value and does it have elements?
            if (childElement.value instanceof Json.ArrayValue && childElement.value.elements.length > 0) {
                // Is the first element in the Array an Object
                if (childElement.value.elements[0].valueKind === Json.ValueKind.ObjectValue) {
                    collapsible = true;
                }
            } else if (childElement.value instanceof Json.ObjectValue && childElement.value.properties.length > 0) {
                collapsible = true;
            }
        }

        let result: IElementInfo = {
            current: {
                key: {
                    start: childElement.startIndex,
                    end: childElement.span.endIndex,
                    kind: undefined,
                },
                value: {
                    start: undefined,
                    end: undefined,
                    kind: undefined,
                },
                level: undefined,
                collapsible: collapsible
            },
            parent: {
                key: {
                    start: undefined,
                    end: undefined,
                    kind: undefined,
                },
                value: {
                    start: undefined,
                    end: undefined,
                    kind: undefined,
                }
            },
            root: {
                key: {
                    start: childElement.startIndex
                }
            }
        };

        if (childElement instanceof Json.Property) {
            result.current.key.kind = childElement.valueKind;
            result.current.value.start = childElement.value.startIndex;
            result.current.value.end = childElement.value.span.afterEndIndex;
            result.current.value.kind = childElement.value.valueKind;
        } else {
            result.current.key.kind = childElement.valueKind;
            result.current.value.start = childElement.startIndex;
            result.current.value.end = childElement.span.afterEndIndex;
            result.current.value.kind = childElement.valueKind;
        }

        // Not a root element
        if (elementInfo) {
            result.parent.key.start = elementInfo.current.key.start;
            result.parent.key.end = elementInfo.current.key.end;
            result.parent.key.kind = elementInfo.current.key.kind;
            result.parent.value.start = elementInfo.current.value.start;
            result.parent.value.end = elementInfo.current.value.end;
            result.root.key.start = elementInfo.root.key.start;
            result.current.level = elementInfo.current.level + 1;
        } else {
            result.current.level = 1;
        }

        return JSON.stringify(result);
    }

    private getIcon(icons: [string, string][], itemName: string, defaultIcon: string) {
        itemName = (itemName || "").toLowerCase();
        let iconItem = icons.find(item => item[0].toLowerCase() === itemName);
        return iconItem ? iconItem[1] : defaultIcon;
    }

    private getIconPath(elementInfo: IElementInfo): string | undefined {

        let icon: string;
        const keyOrResourceNode = this.tree.getValueAtCharacterIndex(elementInfo.current.key.start);

        // Is current element a root element?
        if (elementInfo.current.level === 1) {
            icon = this.getIcon(topLevelIcons, keyOrResourceNode.toString(), "");
        } else if (elementInfo.current.level === 2) {
            // Is current element an element of a root element?

            // Get root value
            const rootNode = this.tree.getValueAtCharacterIndex(elementInfo.root.key.start);
            icon = this.getIcon(topLevelChildIconsByRootNode, rootNode.toString(), "");
        }

        // If resourceType element is found on resource objects set to specific resourceType Icon or else a default resource icon
        if (elementInfo.current.level > 1) {
            if (elementInfo.current.key.kind === Json.ValueKind.ObjectValue) {
                const rootNode = this.tree.getValueAtCharacterIndex(elementInfo.root.key.start);

                if (rootNode.toString().toUpperCase() === "resources".toUpperCase() && keyOrResourceNode instanceof Json.ObjectValue) {
                    for (var i = 0, il = keyOrResourceNode.properties.length; i < il; i++) {

                        var property: string = keyOrResourceNode.properties[i].name.toString().toUpperCase();

                        switch (property) {
                            case "type".toUpperCase(): {
                                let resourceType = keyOrResourceNode.properties[i].value.toString().toUpperCase();
                                icon = this.getIcon(resourceTypeIcons, resourceType, "resources.svg");
                                break;
                            }
                            default: {
                                break;
                            }
                        }
                    }
                }
            }
            if (elementInfo.current.key.kind === Json.ValueKind.PropertyValue) {
                const rootNode = this.tree.getValueAtCharacterIndex(elementInfo.current.key.start);

                var property: string = rootNode.toString().toUpperCase();

                switch (property) {
                    case "copy".toUpperCase(): {
                        icon = this.getIcon(resourceChildIcons, "copy", "loading.svg");
                        break;
                    }
                    case "properties".toUpperCase(): {
                        icon = this.getIcon(resourceChildIcons, "copy", "variables.svg");
                        break;
                    }
                    case "sku".toUpperCase(): {
                        icon = this.getIcon(resourceChildIcons, "copy", "variables.svg");
                        break;
                    }
                    case "tags".toUpperCase(): {
                        icon = this.getIcon(resourceChildIcons, "tags", "tags.svg");
                        break;
                    }
                    default: {
                        break;
                    }
                }
            }
        }

        // If function

        if (icon) {
            return (`${__dirname}/../../icons/${icon}`);
        }

        return undefined;
    }

    private updateTreeState() {
        const activeEditor: vscode.TextEditor = vscode.window.activeTextEditor;
        const document: vscode.TextDocument = !!activeEditor ? activeEditor.document : null;
        this.parseTree(document);
        const showTreeView = this.isArmTemplate(document);

        if (showTreeView) {
            this.refresh();
        }

        this.setTreeViewContext(showTreeView);
    }

    private isArmTemplate(document?: vscode.TextDocument): boolean {
        return !!document && isLanguageIdSupported(document.languageId) && Utilities.isValidSchemaUri(this.getSchemaUri());
    }

    private setTreeViewContext(visible: boolean) {
        vscode.commands.executeCommand('setContext', 'showArmJsonView', visible);
    }

    private getSchemaUri(): string {
        if (!!this.tree) {
            const value: Json.ObjectValue = Json.asObjectValue(this.tree.value);
            if (value) {
                const schema: Json.Value = Json.asStringValue(value.getPropertyValue("$schema"));
                if (schema) {
                    return schema.toString();
                }
            }
        }
        return null;
    }
}

export interface IElementInfo {
    current: {
        key: {
            start: number;
            end: number;
            kind: Json.ValueKind;
        },
        value: {
            start: number;
            end: number;
            kind: Json.ValueKind;
        },
        level: number;
        collapsible: boolean;
    };
    parent: {
        key: {
            start: number;
            end: number;
            kind: Json.ValueKind;
        },
        value: {
            start: number;
            end: number;
            kind: Json.ValueKind;
        }
    };
    root: {
        key: {
            start: number;
        }
    };
}

/**
 * Shortens a label in a way intended to keep the important information but make it easier to read and shorter (so you can read more in the limited horizontal space)
 */
export function shortenTreeLabel(label: string): string {
    let originalLabel = label;

    // If it's an expression - starts and ends with [], but doesn't start with [[, and at least one character inside the []
    if (label && label.match(/^\[[^\[].*]$/)) {

        //  variables/parameters('a') -> [a]
        label = label.replace(/(variables|parameters)\('([^']+)'\)/g, '<$2>');

        // concat(x,'y') => x,'y'
        // Repeat multiple times for recursive cases
        // tslint:disable-next-line:no-constant-condition
        while (true) {
            let newLabel = label.replace(/concat\((.*)\)/g, '$1');
            if (label !== newLabel) {
                label = newLabel;
            } else {
                break;
            }
        }

        if (label !== originalLabel) {
            // If we actually made changes, remove the brackets so users don't think this is the exact expression
            return label.substr(1, label.length - 2);
        }
    }

    return originalLabel;
}
