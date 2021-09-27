/// <reference path="../../../typings/index.d.ts"/>
import path from 'path'
import { promises as fs } from 'fs'
import { createCafsStore } from '@pnpm/package-store'
import createFetcher from '@pnpm/git-fetcher'
import { DependencyManifest } from '@pnpm/types'
import pDefer from 'p-defer'
import tempy from 'tempy'

test('fetch', async () => {
  const cafsDir = tempy.directory()
  const fetch = createFetcher().git
  const manifest = pDefer<DependencyManifest>()
  const { filesIndex } = await fetch(
    createCafsStore(cafsDir),
    {
      commit: 'c9b30e71d704cd30fa71f2edd1ecc7dcc4985493',
      repo: 'https://github.com/kevva/is-positive.git',
      type: 'git',
    },
    {
      manifest,
    }
  )
  expect(filesIndex['package.json']).toBeTruthy()
  expect(filesIndex['package.json'].writeResult).toBeTruthy()
  const name = (await manifest.promise).name
  expect(name).toEqual('is-positive')
})

test('fetch a package from Git that has a prepare script', async () => {
  const cafsDir = tempy.directory()
  const fetch = createFetcher().git
  const manifest = pDefer<DependencyManifest>()
  const { filesIndex } = await fetch(
    createCafsStore(cafsDir),
    {
      commit: 'd2916cab494f6cddc85c921ffa3befb600e00e0e',
      repo: 'https://github.com/pnpm/test-git-fetch.git',
      type: 'git',
    },
    {
      manifest,
    }
  )
  expect(filesIndex[`dist${path.sep}index.js`]).toBeTruthy()
})

test('fetch2', async () => {
  const cafsDir = tempy.directory()
  const fetch = createFetcher().git
  const manifest = pDefer<DependencyManifest>()
  const { tempLocation } = await fetch(
    createCafsStore(cafsDir),
    {
      commit: 'c6640c5ae73aeb5f0bc7b93d916a93eea7883c1c',
      repo: 'https://github.com/LumaKernel/pnpm-issue.git',
      type: 'git',
    },
    {
      manifest,
    }
  )
  expect(await fs.readdir(tempLocation)).toContain('v0_2_0')
  expect(await fs.readdir(tempLocation)).toContain('v1_2_3')
  expect(await fs.readdir(path.resolve(tempLocation, 'v1_2_3'))).toContain('v0_3_0')
  expect((await fs.readFile(path.resolve(tempLocation, 'v1_2_3', 'v0_3_0', 'version.txt'))).toString().trim()).toEqual('v0.3.0')
  expect((await fs.readFile(path.resolve(tempLocation, 'v1_2_3', 'v0_3_0', 'version.txt'))).toString().trim()).toEqual('v0.3.0')
  await expect(async () => fs.stat(path.resolve(tempLocation, 'v1_2_3', 'v0_3_0', '.git'))).rejects.toEqual({
    message: expect.stringContaining('no such file or directory,'),
  })
})
