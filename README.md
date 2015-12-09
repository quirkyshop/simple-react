# 通过模拟最简React学习virtual DOM和diff

## 前言

  更改视图时，更改真实DOM是非常消耗性能的，真实DOM对象非常庞大，稍不留意就造成整棵DOM树的repaint及reflow。
再者，移动端的页面本身流畅性就被诟病，因此DOM的改变就需要更谨慎。

  React的核心在于，如何最小化的去改变DOM。
  
  因此诞生了virtual DOM，virtual DOM实际就是js对象，但是相比与真实DOM要轻好多个数量级。（实际上virtual DOM并不是React第一位发明的）
  
  读到这里，会牵涉到两个问题，
  
  1. virtual DOM 转化为真实DOM  
  
  2. 如何最小程度修改真实DOM
  
  简而言之：
  
  1. 页面生成时，由virtual DOM生成真实DOM
  
  2. 视图更新时，通过对新旧virtual DOM 树的差异计算，最终获得新的virtual DOM树，利用这棵js层面算得的树去对真实DOM树做调整，

## 模拟

  项目的文件分别代表模拟最简react的步骤
  
  * `vd` 创建virtual DOM
  * `diff` 比较virtual DOM差异
  * `patch` 更具相应差异调整
  * `update` virtual DOM 差异反馈到真实DOM
  
  
  
  
