import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-native";

// Create a Resource Group
const resourceGroup = new azure.resources.ResourceGroup("resourceGroup", {
    resourceGroupName: "myResourceGroup",
    location: "WestUS",
});

// Create a Virtual Network
const virtualNetwork = new azure.network.VirtualNetwork("virtualNetwork", {
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    addressSpace: { addressPrefixes: ["10.0.0.0/16"] },
});

// Create Subnets
const appServiceSubnet = new azure.network.Subnet("appServiceSubnet", {
    resourceGroupName: resourceGroup.name,
    virtualNetworkName: virtualNetwork.name,
    addressPrefix: "10.0.1.0/24",
    serviceEndpoints: [{ service: "Microsoft.Web" }],
});

const appGatewaySubnet = new azure.network.Subnet("appGatewaySubnet", {
    resourceGroupName: resourceGroup.name,
    virtualNetworkName: virtualNetwork.name,
    addressPrefix: "10.0.2.0/24",
});

// Create an App Service Plan
const appServicePlan = new azure.web.AppServicePlan("appServicePlan", {
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    sku: {
        name: "B1",
        tier: "Basic",
    },
});

// Create an App Service
const appService = new azure.web.WebApp("appService", {
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    serverFarmId: appServicePlan.id,
    siteConfig: {
        appSettings: [{ name: "WEBSITE_RUN_FROM_PACKAGE", value: "1" }],
    },
});

// Create a Public IP Address
const publicIp = new azure.network.PublicIPAddress("publicIp", {
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    publicIPAllocationMethod: "Dynamic",
});

// Create an Application Gateway
const appGateway: azure.network.ApplicationGateway  = new azure.network.ApplicationGateway("appGateway", {
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    sku: {
        name: "Standard_Small",
        tier: "Standard",
        capacity: 2,
    },
    gatewayIPConfigurations: [{
        name: "appGatewayIpConfig",
        subnet: { id: appGatewaySubnet.id },
    }],
    frontendIPConfigurations: [{
        name: "appGatewayFrontendIpConfig",
        publicIPAddress: { id: publicIp.id },
    }],
    backendAddressPools: [{
        name: "appGatewayBackendPool",
        backendAddresses: [{ fqdn: appService.defaultHostName }],
    }],
    frontendPorts: [{
        name: "appGatewayFrontendPort",
        port: 80,
    }],
});
