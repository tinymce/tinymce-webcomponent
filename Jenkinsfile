#!groovy
@Library('waluigi@release/7') _

beehiveFlowBuild(
  test: {
    def platforms = [
      [ os: "windows", browser: "chrome" ],
      [ os: "windows", browser: "firefox" ]
    ]
    bedrockBrowsers(platforms: platforms, testDirs: ["src/test/ts/browser"])
  }
)
