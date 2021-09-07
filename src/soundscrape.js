function pyInstall(app) {
    const v = '3.8.3'
    app.doShellScript(`
        if ! command -v python &> /dev/null;then

            sudo true; 
            f=python-${v}-macosx10.9.pkg; 
            cd $TMPDIR;
            { 
                curl -LfOsS https://www.python.org/ftp/python/${v}/\$f; 
                cd ~-; 
            } && sudo installer -pkg $TMPDIR/$f -target / && \
                v=$(echo "$v"|cut -d'.' -f1-2) && \
                "/Applications/Python ${v}/Update Shell Profile.command" && \
                source ~/.bash_profile
        fi
        `, 
        { administratorPrivileges:true }
    )
}

function pyEnv(app) {
    app.doShellScript(`
        source soundscrape/bin/activate || true
        if ! command -v soundscrape &> /dev/null; then
            pip3 install --upgrade pip;
            pip3 install --upgrade virtualenv;
            virtualenv soundscrape;
            source soundscrape/bin/activate
            pip install soundscrape;
            deactivate
        fi
    `)
}

function deletePy(app) {
    app.doShellScript(`
        sudo rm -rf /Library/Frameworks/Python.framework/Versions/?.*; 
        sudo rm -rf "/Applications/Python "?.?; 
        cd /usr/local/bin && { ls -l | grep '/Library/Frameworks/Python.framework/Versions/*' | awk '{print $9}' | tr -d @ | xargs sudo rm -rfv;
        cd ~-; };
        b="$HOME/.bash_profile"; 
        sed -i.bak '/Frameworks\/Python*/d' $b; 
        sed -i '' '/PATH for Python/d' $b;
        sed -i '' '/bash_profile\.pysave/d' $b && nano ~/.bash_profile
    `)
}

export default ({ cmd, folder, uninstall = false }) => {
    const app = Application.currentApplication();
    app.includeStandardAdditions = true;
    pyInstall(app)
    pyEnv(app)

    if (uninstall) {
        deletePy(app)
        return
    }
    app.doShellScript('source soundscrape/bin/activate')
    const res = app.doShellScript(`cd ${folder} && soundscrape -f ${cmd}`);

    app.displayDialog("Result : " + String(res))
    app.doShellScript('deactivate')

    return res
}