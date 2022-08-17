#!groovy
@Library('waluigi@v6.0.0') _

beehiveFlowBuild(
  test: {
    def platforms = [
      [ os: "windows-10", browser: "chrome" ],
      [ os: "windows-10", browser: "firefox" ]
    ]
    bedrockBrowsers(platforms: platforms, testDirs: ["src/test/ts/browser"])
  }
)
