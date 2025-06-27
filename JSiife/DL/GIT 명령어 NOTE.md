
## 💗 Commit-Push
```
# 현재브랜치 확인
git branch -a

# 브랜치이동 
git checkout feature/chae0


# Stage에 모두 올리기
git add .
## git add -u :  하나 이전의 스테이지와 비교해서 변경된 부분만 add. 새롭게 만들어진 파일은 add 하지않음.
## git add -A : 새로만든 것, 수정, 삭제 등 모든 변경된 파일을 add 해준다.

# Stage에 모두 내리기
git reset .

# Commit 하기
git commit -m 'init'

# push 하기
git push origin main

# 초기화
git reset --hard
```

https://clolee.tistory.com/78


## 초기셋팅 
```

git init 

git add README.md

git commit -m "first commit"

git branch -M main

git remote add origin https://github.com/chae-yeong-kim/RealGridDemo.git

git push -u origin main


## 브랜치 분리
### feature/~ 에서 작업을 하고 develop에서 모두 병합을 한 뒤에 master에 최종 반영하는 시나리오
### https://kimforest.tistory.com/34

git branch develop

git branch -a
  develop
* main
  remotes/origin/main


git checkout develop

git branch feature/S01
git branch feature/S02

git push -u origin 생성한브랜치명 #publish branch




```



- git Alias 설정 [링크](https://frontj.com/entry/Git-Alias%EB%A5%BC-%EC%84%A4%EC%A0%95%ED%95%B4%EB%B3%B4%EC%9E%90-%EA%B9%83-%EB%AA%85%EB%A0%B9%EC%96%B4%EB%A5%BC-%EC%89%BD%EA%B3%A0-%EB%B9%A0%EB%A5%B4%EA%B2%8C-%EC%82%AC%EC%9A%A9%ED%95%98%EB%8A%94-%EB%B0%A9%EB%B2%95)

mvn spring-boot:run 

git merge origin/main


https://bo5mi.tistory.com/216

## 💗git merge 코드
```
# 1. main 브랜치로 이동
git checkout main

# 2. 최신 상태로 동기화
git pull origin main

# 3. feature/jhim 병합 
git merge chae0
git commit


# 4. 병합 결과 push
git push origin main  // 여기를 사이트에서 진행 


# 1. feature 브랜치에 있는 상태에서
git checkout feature
git checkout chae0

# 2. 최신 main을 가져오고 병합
git fetch origin
git merge origin/main

3. commit 누르기

=> 사이트에서 함
```
![[Pasted image 20250609155334.png]]

git stash save "저장 후 Detail로 이동 Backup"


## 💗Stash
```
git stash save "작업 중인 기능 개발 중"

git stash list

user: purchaseproject $ git stash list
stash@{0}: On chae0: Mybatis Test : Commbo Tag crash.. STOP
stash@{1}: WIP on chae0: b929ca7 Merge branch 'chae0'

```