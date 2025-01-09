To update and deploy the stack in the Azure environment; Follow the below steps after chek-out the code in local
# Change directories to your project workspace
cd <path-to-project>

# Select this stack
pulumi stack select sakthisaravana/pulumi-basic/dev

# Run the program to update the stack
pulumi up

The Azure CLI, and thus Pulumi, will use the default subscription for the account. You can change the active subscription with,
# To login from CLI
az login

# To list the azure accounts
az account list

# To set the account to use
az account set --subscription=<id>
