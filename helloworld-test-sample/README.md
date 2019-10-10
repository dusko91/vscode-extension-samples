# Instructions for designing testable code for InputBox and QuickInput

1. Define an interface such as IAzureUserInput from https://github.com/microsoft/vscode-azuretools/blob/master/ui/index.d.ts
2. Define a class used for interactive input of data such as https://github.com/microsoft/vscode-azuretools/blob/master/ui/src/AzureUserInput.ts
3. Define a class that enables programatically defined input such as https://github.com/microsoft/vscode-azuretools/blob/master/dev/src/TestUserInput.ts
4. The classes from 2. and 3. should implement the interface from 1.
5. When the extension is executed only the methods from 2. should be used such as showInputBox, showWarningMessage, showQuickPick
6. When the extension is tested only the methods from 3. should be used.
7. The switch between the 2. and 3. could be done by introducing a global variable whose type is 1. and assigning it proper object depending if a extension is tested or not
