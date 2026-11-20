import {readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
let count=0;
for(const dir of ['app','public','tools']){
  for(const file of await readdir(dir,{recursive:true})){
    if(!file.endsWith('.php'))continue;
    const result=spawnSync('php',['-l',`${dir}/${file}`],{encoding:'utf8'});
    if(result.status!==0){console.error(result.stdout,result.stderr);process.exit(1);}count++;
  }
}
const result=spawnSync('php',['-l','router.php'],{encoding:'utf8'});
if(result.status!==0){console.error(result.stdout,result.stderr);process.exit(1);}
console.log(`${count+1} PHP files passed syntax checks.`);
