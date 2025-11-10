'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header, Media } from '@/payload-types'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)

  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  // Helper function to generate proper href from link field
  const generateHref = (link: any) => {
    if (!link) return '#'

    if (link.type === 'custom') {
      return link.url || '#'
    }

    if (link.type === 'reference' && link.reference) {
      if (typeof link.reference === 'object') {
        // Handle relationship reference
        return `/${link.reference.slug || link.reference.id || ''}`
      }
      return `/${link.reference}`
    }

    return '#'
  }

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  // Close mobile menu when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false)
    setOpenDropdown(null)
  }, [pathname])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const toggleSearch = () => {
    setSearchOpen(!searchOpen)
  }

  const handleDropdownHover = (index: number | null) => {
    setOpenDropdown(index)
  }

  return (
    <>
      {/* Header */}
      <header
        className="bg-gray-dark sticky top-0 z-50"
        {...(theme ? { 'data-theme': theme } : {})}
      >
        <div className="container mx-auto flex justify-between items-center py-4 px-4">
          <Link href="/" className="flex items-center">
            {data.logo && typeof data.logo === 'object' && (
              <Image
                src={(data.logo as Media).url || '/template-white-logo.png'}
                alt="Logo"
                width={325}
                height={104}
                className="h-14 w-auto"
                priority
              />
            )}
            {!data.logo && (
              <Image
                src="/template-white-logo.png"
                alt="Logo"
                width={325}
                height={104}
                className="h-14 w-auto"
                priority
              />
            )}
          </Link>

          {/* Center section: Menu */}
          <nav className="hidden lg:flex md-grow justify-center">
            <ul className="flex items-center space-x-4 text-white">
              {data.navItems?.map((item, index) => {
                const href = generateHref(item.link)

                if (item.hasDropdown && item.dropdownItems && item.dropdownItems.length > 0) {
                  return (
                    <li
                      key={index}
                      className="relative group"
                      onMouseEnter={() => handleDropdownHover(index)}
                      onMouseLeave={() => handleDropdownHover(null)}
                    >
                      <Link
                        href={href}
                        className="hover:text-primary font-semibold flex items-center"
                      >
                        {item.link?.label}
                        <i
                          className={`ml-1 text-xs ${openDropdown === index ? 'fas fa-chevron-up' : 'fas fa-chevron-down'}`}
                        ></i>
                      </Link>
                      <ul
                        className={`absolute left-0 bg-white text-black space-y-2 mt-1 p-2 rounded shadow-lg transition-all duration-100 ${
                          openDropdown === index
                            ? 'opacity-100 scale-100 visible'
                            : 'opacity-0 scale-90 invisible'
                        }`}
                      >
                        {item.dropdownItems.map((dropItem, dropIndex) => {
                          const dropHref = generateHref(dropItem.link)
                          return (
                            <li key={dropIndex}>
                              <Link
                                href={dropHref}
                                className="min-w-40 block px-4 py-2 hover:bg-primary hover:text-white rounded"
                              >
                                {dropItem.link?.label}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    </li>
                  )
                } else {
                  return (
                    <li key={index}>
                      <Link href={href} className="hover:text-primary font-semibold">
                        {item.link?.label}
                      </Link>
                    </li>
                  )
                }
              })}
            </ul>
          </nav>

          {/* Hamburger menu (for mobile) */}
          <div className="flex lg:hidden ml-auto">
            <button
              id="hamburger"
              className="text-white focus:outline-none"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                ></path>
              </svg>
            </button>
          </div>

          {/* Right section: Buttons (for desktop) */}
          <div className="hidden lg:flex items-center space-x-3 flex-shrink-0">
            {/* Authentication buttons - hardcoded */}
            <Link
              href="/register"
              className="bg-primary border border-primary hover:bg-transparent text-white hover:text-primary font-semibold px-4 py-2 rounded-full inline-block"
            >
              Înregistrare
            </Link>
            <Link
              href="/login"
              className="bg-primary border border-primary hover:bg-transparent text-white hover:text-primary font-semibold px-4 py-2 rounded-full inline-block"
            >
              Conectare
            </Link>

            {/* Cart icon with dropdown */}
            <div className="relative group cart-wrapper">
              <Link href="/cart">
                <Image
                  src="/assets/images/cart-shopping.svg"
                  alt="Cart"
                  width={24}
                  height={24}
                  className="h-6 w-6 group-hover:scale-120"
                />
              </Link>
              {/* Cart dropdown */}
              <div className="absolute right-0 mt-1 w-80 bg-white shadow-lg p-4 rounded hidden group-hover:block">
                <div className="space-y-4">
                  {/* TODO: Replace with dynamic cart items */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-line">
                    <div className="flex items-center">
                      <Image
                        src="/assets/images/single-product/1.jpg"
                        alt="Product"
                        width={48}
                        height={48}
                        className="h-12 w-12 object-cover rounded mr-2"
                      />
                      <div>
                        <p className="font-semibold">Summer black dress</p>
                        <p className="text-sm">Quantity: 1</p>
                      </div>
                    </div>
                    <p className="font-semibold">$25.00</p>
                  </div>
                </div>
                <Link
                  href="/cart"
                  className="block text-center mt-4 border border-primary bg-primary hover:bg-transparent text-white hover:text-primary py-2 rounded-full font-semibold"
                >
                  Go to Cart
                </Link>
              </div>
            </div>

            {/* Search icon */}
            {data.searchSettings?.showSearch && (
              <>
                <button
                  id="search-icon"
                  onClick={toggleSearch}
                  className="text-white hover:text-primary group"
                  aria-label="Toggle search"
                >
                  <Image
                    src="/assets/images/search-icon.svg"
                    alt="Search"
                    width={24}
                    height={24}
                    className="h-6 w-6 transition-transform transform group-hover:scale-120"
                  />
                </button>

                {/* Search field */}
                {searchOpen && (
                  <div className="absolute top-full right-0 mt-2 w-full bg-white shadow-lg p-2 rounded search-slide-down">
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded text-black"
                      placeholder={
                        data.searchSettings.searchPlaceholder || 'Search for products...'
                      }
                      autoFocus
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
          onClick={toggleMobileMenu}
        >
          <div className="mobile-menu bg-white w-64 h-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b">
              <button
                onClick={toggleMobileMenu}
                className="float-right text-gray-600"
                aria-label="Close mobile menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <ul className="mobile-menu-items">
              {data.navItems?.map((item, index) => {
                const href = generateHref(item.link)

                return (
                  <li key={index}>
                    <Link
                      href={href}
                      className="block text-gray-800 font-semibold"
                      onClick={toggleMobileMenu}
                    >
                      {item.link?.label}
                    </Link>
                    {item.hasDropdown && item.dropdownItems && item.dropdownItems.length > 0 && (
                      <ul className="mobile-dropdown-menu pl-4">
                        {item.dropdownItems.map((dropItem, dropIndex) => {
                          const dropHref = generateHref(dropItem.link)
                          return (
                            <li key={dropIndex}>
                              <Link
                                href={dropHref}
                                className="block text-gray-600"
                                onClick={toggleMobileMenu}
                              >
                                {dropItem.link?.label}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>

            {/* Mobile auth buttons - hardcoded */}
            <div className="p-4 space-y-2">
              <Link
                href="/register"
                className="block w-full bg-primary border border-primary hover:bg-transparent text-white hover:text-primary font-semibold px-4 py-2 rounded-full text-center"
                onClick={toggleMobileMenu}
              >
                Înregistrare
              </Link>
              <Link
                href="/login"
                className="block w-full bg-transparent border border-primary text-primary hover:bg-primary hover:text-white font-semibold px-4 py-2 rounded-full text-center"
                onClick={toggleMobileMenu}
              >
                Conectare
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
