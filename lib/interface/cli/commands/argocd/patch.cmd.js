const Command = require('../../Command');

const applyRoot = require('../root/apply.cmd');
const { downloadArgo } = require('../hybrid/helper');
const { Runner, components } = require('../../../../binary');

const command = new Command({
    root: false,
    parent: applyRoot,
    command: 'argocd-agent',
    description: 'Patch argo agent',
    webDocs: {
        category: 'Argo',
        title: 'Patch',
        weight: 100,
    },
    builder: (yargs) => {
        yargs
            .option('kube-config-path', {
                describe: 'Path to kubeconfig file (default is $HOME/.kube/config)',
            })
            .example(
                'codefresh patch argocd-agent',
                'Update argocd-agent',
            );
    },
    handler: async (argv) => {
        const { 'kube-config-path': kubeConfigPath } = argv;

        const binLocation = await downloadArgo();
        const componentRunner = new Runner(binLocation);

        const commands = [
            'update',
        ];

        if (kubeConfigPath) {
            commands.push('--kubeconfig');
            commands.push(kubeConfigPath);
        }

        await componentRunner.run(components.argo, commands);
    },
});

module.exports = command;
