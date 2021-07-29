sa = require 'superagent'
FormData = require 'form-data'
sha256 = require 'js-sha256'

appKey = '1604e367c2c61da1'
key = 'OLiDsWKhnGa54XAgeSoZVCeaULnL8Ubh'

truncate = (q) ->
  len = q.length
  if len <= 20 then q
  else (q.substring 0, 10) + len + q.substring len - 10

module.exports = (text, to) ->
  salt = (new Date).getTime()
  ctime = Math.round salt/1000
  sign = sha256 appKey + (truncate text) + salt + ctime + key

  form = new FormData
  form.append 'q', text
  form.append 'appKey', appKey
  form.append 'salt', salt
#  form.append 'from', 'ja'
  form.append 'to', to ? 'zh-CHS'
  form.append 'sign', sign
  form.append 'signType', 'v3'
  form.append 'curtime', ctime

  res = await sa.post 'http://openapi.youdao.com/api'
    .set form.getHeaders()
    .send form.getBuffer()
  return res.body
