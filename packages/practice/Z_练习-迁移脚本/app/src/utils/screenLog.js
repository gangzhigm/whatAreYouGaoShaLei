/* eslint-disable */
export const printANSI = () => {
  // console.clear()
  // console.log('[qiankun micro app] created()')
  // ASCII - ANSI Shadow
  let text = `
[main app] created()
------------------------------------
  Powered by Team
                                      
  ██████╗ ███╗   ███╗████████╗
  ██╔══██╗████╗ ████║╚══██╔══╝
  ██║  ██║██╔████╔██║   ██║   
  ██║  ██║██║╚██╔╝██║   ██║   
  ██████╔╝██║ ╚═╝ ██║   ██║   
  ╚═════╝ ╚═╝     ╚═╝   ╚═╝       
------------------------------------
environment: ${process.env.NODE_ENV}
commit_hash: ${process.env.COMMITHASH}
commit_time: ${new Date(process.env.LASTCOMMITDATETIME).toLocaleString()}
 build_time: ${process.env.BUILD_DATE}
    version: ${process.env.VERSION}
     branch: ${process.env.BRANCH}`;
  const color = '#0cc2a9';
  console.log(`%c${text}`, `color: ${color}`);
};
