#!groovy
@Library('waluigi@v4.0.0') _

standardProperties()

node("primary") {
  echo "Clean workspace"
  cleanWs()

  stage("checkout") {
    checkout scm
  }

  stage("dependencies") {
    sh "yarn install"
  }

  stage("stamp") {
    sh "yarn beehive-flow stamp"
  }

  stage("build") {
    sh "yarn build"
  }

  stage("lint") {
    sh "yarn lint"
  }

  def platforms = [
    [ name: "win10Chrome", os: "windows-10", browser: "chrome" ],
    [ name: "win10FF", os: "windows-10", browser: "firefox" ]
  ]

  bedrockBrowsers(platforms: platforms, testDirs: [ "src/test/ts/browser" ])

  stage("publish") {
    sh "yarn beehive-flow publish"
    sshagent(credentials: ['jenkins2-github']) {
      sh "yarn beehive-flow advance-ci"
    }
  }
}
