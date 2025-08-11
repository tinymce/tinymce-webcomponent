#!groovy
@Library('waluigi@release/7') _

mixedBeehiveFlow(
  container: [ resourceRequestMemory: '3Gi', resourceLimitMemory: '3Gi' ],
  testPrefix: 'Tiny-WebComponent',
  platforms: [
    [ browser: 'chrome', headless: true ],
    [ browser: 'firefox', provider: 'aws', buckets: 1 ],
    [ browser: 'safari', provider: 'lambdatest', buckets: 1 ]
  ],
  preparePublish: {
    yarnInstall()
    sh "yarn build"
  }
)
