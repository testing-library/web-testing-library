<div align="center">
<h1>Web Testing Library</h1>

<a href="https://www.emojione.com/emoji/1f419">
  <img
    height="80"
    width="80"
    alt="octopus"
    src="https://raw.githubusercontent.com/testing-library/web-testing-library/main/other/octopus.png"
  />
</a>

<p>Simple and complete Web testing utilities that encourage good testing
practices.</p>

[**Read the docs**](https://testing-library.com/dom) |
[Edit the docs](https://github.com/testing-library/testing-library-docs)

</div>

<hr />

<!-- prettier-ignore-start -->
[![Build Status][build-badge]][build]
[![Code Coverage][coverage-badge]][coverage]
[![version][version-badge]][package]
[![downloads][downloads-badge]][npmtrends]
[![MIT License][license-badge]][license]
[![All Contributors][all-contributors-badge]](#contributors)
[![PRs Welcome][prs-badge]][prs]
[![Code of Conduct][coc-badge]][coc]
[![Discord][discord-badge]][discord]

[![Watch on GitHub][github-watch-badge]][github-watch]
[![Star on GitHub][github-star-badge]][github-star]
[![Tweet][twitter-badge]][twitter]
<!-- prettier-ignore-end -->

<div align="center">
  <a href="https://testingjavascript.com">
    <img
      width="500"
      alt="TestingJavaScript.com Learn the smart, efficient way to test any JavaScript application."
      src="https://raw.githubusercontent.com/testing-library/web-testing-library/main/other/testingjavascript.jpg"
    />
  </a>
</div>

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [The Problem](#the-problem)
- [This Solution](#this-solution)
- [Installation](#installation)
- [Documentation](#documentation)
- [Guiding Principles](#guiding-principles)
- [Contributors](#contributors)
- [LICENSE](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## The Problem

You want to write maintainable tests for the
[Web Platform](https://proposal-common-min-api.deno.dev/) or React Native. As a
part of this goal, you want your tests to avoid including implementation details
of your components and rather focus on making your tests give you the confidence
for which they are intended. As part of this, you want your testbase to be
maintainable in the long run so refactors of your components (changes to
implementation but not functionality) don't break your tests and slow you and
your team down.

## This Solution

The `Web Testing Library` is a very light-weight solution for testing code that
runs on the Web Platform (a browser, [Node.js][node], [Deno](https://deno.land/)
etc) or React Native. The main utilities it provides involve querying the DOM
for nodes in a way that's similar to how the user finds elements on the page. In
this way, the library helps ensure your tests give you confidence in your UI
code. The `DOM Testing Library`'s primary guiding principle is:

> [The more your tests resemble the way your software is used, the more
> confidence they can give you.][guiding-principle]

## Installation

This module is distributed via [npm][npm] and should be installed as one of your
project's `devDependencies`:

```
npm install --save-dev @testing-library/dom
```

> [**Docs**](https://testing-library.com/docs/install)

## Documentation

Read the docs (and discover framework and tool-specific implementations) at
[testing-library.com](https://testing-library.com/web)

## Guiding Principles

> [The more your tests resemble the way your software is used, the more
> confidence they can give you.][guiding-principle]

We try to only expose methods and utilities that encourage you to write tests
that closely resemble how your code is used on the Web Platform or React Native.

Utilities are included in this project based on the following guiding
principles:

1. They should be usable on both the Web Platform **and** React Native
2. It should be generally useful for testing the application in the way the user
   would use it. We _are_ making some trade-offs here because we're using a
   computer and often a simulated environment, but in general, utilities should
   encourage tests that use the application the way they're intended to be used.
3. Utility implementations and APIs should be simple and flexible.

At the end of the day, what we want is for this library to be pretty
light-weight, simple, and understandable.

## Contributors ✨

Thanks goes to these wonderful people
([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://augustinlf.com/"><img src="https://avatars.githubusercontent.com/u/5271169?v=4?s=100" width="100px;" alt="Augustin Le Fèvre"/><br /><sub><b>Augustin Le Fèvre</b></sub></a><br /><a href="#ideas-AugustinLF" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://nickmccurdy.com/"><img src="https://avatars.githubusercontent.com/u/927220?v=4?s=100" width="100px;" alt="Nick McCurdy"/><br /><sub><b>Nick McCurdy</b></sub></a><br /><a href="#ideas-nickmccurdy" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://twitch.tv/jacobmgevans"><img src="https://avatars.githubusercontent.com/u/27247160?v=4?s=100" width="100px;" alt="Jacob M-G Evans"/><br /><sub><b>Jacob M-G Evans</b></sub></a><br /><a href="#ideas-JacobMGEvans" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://solverfox.dev/"><img src="https://avatars.githubusercontent.com/u/12292047?v=4?s=100" width="100px;" alt="Sebastian Silbermann"/><br /><sub><b>Sebastian Silbermann</b></sub></a><br /><a href="https://github.com/testing-library/web-testing-library/commits?author=eps1lon" title="Code">💻</a> <a href="#ideas-eps1lon" title="Ideas, Planning, & Feedback">🤔</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the
[all-contributors](https://github.com/all-contributors/all-contributors)
specification. Contributions of any kind welcome!

## LICENSE

[MIT](LICENSE)

<!-- prettier-ignore-start -->

[npm]: https://www.npmjs.com/
[node]: https://nodejs.org
[build-badge]: https://img.shields.io/github/workflow/status/testing-library/web-testing-library/validate?logo=github&style=flat-square
[build]: https://github.com/testing-library/web-testing-library/actions?query=workflow%3Avalidate
[coverage-badge]: https://img.shields.io/codecov/c/github/testing-library/web-testing-library.svg?style=flat-square
[coverage]: https://codecov.io/github/testing-library/web-testing-library
[version-badge]: https://img.shields.io/npm/v/@testing-library/dom.svg?style=flat-square
[package]: https://www.npmjs.com/package/@testing-library/dom
[downloads-badge]: https://img.shields.io/npm/dm/@testing-library/dom.svg?style=flat-square
[npmtrends]: http://www.npmtrends.com/@testing-library/dom
[license-badge]: https://img.shields.io/npm/l/@testing-library/dom.svg?style=flat-square
[license]: https://github.com/testing-library/web-testing-library/blob/main/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[coc-badge]: https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square
[coc]: https://github.com/testing-library/web-testing-library/blob/main/CODE_OF_CONDUCT.md
[github-watch-badge]: https://img.shields.io/github/watchers/testing-library/web-testing-library.svg?style=social
[github-watch]: https://github.com/testing-library/web-testing-library/watchers
[github-star-badge]: https://img.shields.io/github/stars/testing-library/web-testing-library.svg?style=social
[github-star]: https://github.com/testing-library/web-testing-library/stargazers
[twitter]: https://twitter.com/intent/tweet?text=Check%20out%20dom-testing-library%20by%20%40testing-library%20https%3A%2F%2Fgithub.com%2Ftesting-library%2Fdom-testing-library%20%F0%9F%91%8D
[twitter-badge]: https://img.shields.io/twitter/url/https/github.com/testing-library/web-testing-library.svg?style=social
[emojis]: https://github.com/all-contributors/all-contributors#emoji-key
[all-contributors]: https://github.com/all-contributors/all-contributors
[all-contributors-badge]: https://img.shields.io/github/all-contributors/testing-library/web-testing-library?color=orange&style=flat-square
[set-immediate]: https://developer.mozilla.org/en-US/docs/Web/API/Window/setImmediate
[guiding-principle]: https://twitter.com/kentcdodds/status/977018512689455106
[jest]: https://facebook.github.io/jest
[discord-badge]: https://img.shields.io/discord/723559267868737556.svg?color=7389D8&labelColor=6A7EC2&logo=discord&logoColor=ffffff&style=flat-square
[discord]: https://discord.gg/testing-library

<!-- prettier-ignore-end -->
