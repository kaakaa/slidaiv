readonly COMMITHASH=66386b8e533fa49cb8e301b806e466cf86c16944 # v0.49.4
readonly ROOTDIR=$(pwd)

if [ ! -d slidev ]; then
    echo '===> mkdir slidev'
    mkdir slidev
fi

cd slidev

if [ ! -d .git ]; then
    echo '===> git init'
    git init
    git config --local uploadpack.allowReachableSHA1InWant true
    git remote add origin https://github.com/slidevjs/slidev.git
fi

git fetch --depth=1 origin $COMMITHASH
git reset --hard FETCH_HEAD

cd ${ROOTDIR}/slidev/packages/parser
pnpm install
cd ${ROOTDIR}/slidev/packages/types
pnpm install

cd ${ROOTDIR}
pnpm install ./slidev/packages/parser
pnpm install ./slidev/packages/types
