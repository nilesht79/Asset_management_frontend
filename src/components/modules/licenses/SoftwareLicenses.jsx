import React, { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Modal,
  Form,
  InputNumber,
  Tag,
  message,
  Tooltip,
  Typography,
  Tabs,
  Popconfirm,
  Progress,
  Row,
  Col,
  Statistic,
  DatePicker,
  Descriptions,
  Alert,
  Drawer,
  List,
  Avatar,
  Badge,
  Upload,
  Divider,
  Result,
  Dropdown
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SafetyCertificateOutlined,
  WarningOutlined,
  BarChartOutlined,
  EyeOutlined,
  DesktopOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  KeyOutlined,
  ExclamationCircleOutlined,
  UploadOutlined,
  DownloadOutlined,
  InboxOutlined,
  FileExcelOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'
import licenseService from '../../../services/license'
import masterService from '../../../services/master'

const { Search } = Input
const { Option } = Select
const { Title, Text } = Typography
const { Dragger } = Upload

const SoftwareLicenses = () => {
  const [activeTab, setActiveTab] = useState('licenses')

  // Licenses state
  const [licenses, setLicenses] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [filters, setFilters] = useState({ search: '', license_type: '', status: '' })

  // Report state
  const [reportData, setReportData] = useState({ licenses: [], summary: {} })
  const [reportLoading, setReportLoading] = useState(false)

  // Products for dropdown (software only)
  const [products, setProducts] = useState([])
  const [vendors, setVendors] = useState([])

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [selectedLicense, setSelectedLicense] = useState(null)
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)

  // Form
  const [form] = Form.useForm()
  const [keysForm] = Form.useForm()

  // License Keys state
  const [keysModalOpen, setKeysModalOpen] = useState(false)
  const [licenseKeys, setLicenseKeys] = useState([])
  const [keysLoading, setKeysLoading] = useState(false)
  const [addingKeys, setAddingKeys] = useState(false)

  // Bulk Upload state
  const [bulkUploadModalOpen, setBulkUploadModalOpen] = useState(false)
  const [bulkUploadData, setBulkUploadData] = useState([])
  const [bulkUploading, setBulkUploading] = useState(false)
  const [bulkUploadResult, setBulkUploadResult] = useState(null)
  const [bulkUploadStep, setBulkUploadStep] = useState('upload') // 'upload', 'preview', 'result'

  useEffect(() => {
    loadProducts()
    loadVendors()
  }, [])

  useEffect(() => {
    if (activeTab === 'licenses') {
      loadLicenses()
    } else if (activeTab === 'report') {
      loadReport()
    }
  }, [activeTab, pagination.current, pagination.pageSize, filters])

  const loadLicenses = async () => {
    setLoading(true)
    try {
      const response = await licenseService.getLicenses({
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      })
      if (response.data.success) {
        setLicenses(response.data.data.licenses)
        setPagination(prev => ({
          ...prev,
          total: response.data.data.pagination?.total || 0
        }))
      }
    } catch (error) {
      message.error('Failed to load licenses')
    } finally {
      setLoading(false)
    }
  }

  const loadReport = async () => {
    setReportLoading(true)
    try {
      const response = await licenseService.getUtilizationReport()
      if (response.data.success) {
        setReportData(response.data.data)
      }
    } catch (error) {
      message.error('Failed to load utilization report')
    } finally {
      setReportLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      // Get only software products for licenses
      const response = await masterService.getSoftwareProducts({ limit: 1000 })
      if (response.data.success) {
        setProducts(response.data.data.products || [])
      }
    } catch (error) {
      console.error('Failed to load software products:', error)
    }
  }

  const loadVendors = async () => {
    try {
      const response = await masterService.getVendors({ limit: 1000 })
      if (response.data.success) {
        setVendors(response.data.data.vendors || [])
      }
    } catch (error) {
      console.error('Failed to load vendors:', error)
    }
  }

  const handleCreate = () => {
    setModalMode('create')
    setSelectedLicense(null)
    form.resetFields()
    form.setFieldsValue({ license_type: 'per_device', total_licenses: 1 })
    setModalOpen(true)
  }

  const handleEdit = (record) => {
    setModalMode('edit')
    setSelectedLicense(record)
    form.setFieldsValue({
      ...record,
      purchase_date: record.purchase_date ? dayjs(record.purchase_date) : null,
      expiration_date: record.expiration_date ? dayjs(record.expiration_date) : null,
      support_end_date: record.support_end_date ? dayjs(record.support_end_date) : null
    })
    setModalOpen(true)
  }

  const handleViewDetails = async (record) => {
    try {
      const response = await licenseService.getLicense(record.id)
      if (response.data.success) {
        setSelectedLicense(response.data.data)
        setDetailDrawerOpen(true)
      }
    } catch (error) {
      message.error('Failed to load license details')
    }
  }

  const handleDelete = async (id) => {
    try {
      await licenseService.deleteLicense(id)
      message.success('License deleted successfully')
      loadLicenses()
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to delete license')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      const licenseType = values.license_type
      const totalLicenses = values.total_licenses
      const isMasterKeyType = ['site', 'volume', 'concurrent'].includes(licenseType)

      // For per_user/per_device, validate that all license keys are provided
      if (!isMasterKeyType && modalMode === 'create') {
        const licenseKeysInput = values.license_keys_bulk || ''
        const keysArray = licenseKeysInput
          .split(/[,;\n]+/)
          .map(k => k.trim())
          .filter(k => k.length > 0)

        if (keysArray.length !== totalLicenses) {
          message.error(`You must provide exactly ${totalLicenses} license key(s). You provided ${keysArray.length}.`)
          return
        }
      }

      // For site/volume/concurrent, validate that master key is provided
      if (isMasterKeyType && modalMode === 'create') {
        if (!values.license_key || !values.license_key.trim()) {
          message.error('Master License Key is required for this license type')
          return
        }
      }

      // Format dates
      const data = {
        ...values,
        purchase_date: values.purchase_date?.format('YYYY-MM-DD'),
        expiration_date: values.expiration_date?.format('YYYY-MM-DD'),
        support_end_date: values.support_end_date?.format('YYYY-MM-DD')
      }

      // Remove bulk keys from data sent to create license (will be added separately)
      const licenseKeysBulk = data.license_keys_bulk
      delete data.license_keys_bulk

      if (modalMode === 'create') {
        const response = await licenseService.createLicense(data)
        const newLicenseId = response.data.data.id

        // For per_user/per_device, add all the license keys after creating the license
        if (!isMasterKeyType && licenseKeysBulk) {
          const keysArray = licenseKeysBulk
            .split(/[,;\n]+/)
            .map(k => k.trim())
            .filter(k => k.length > 0)

          if (keysArray.length > 0) {
            await licenseService.addLicenseKeys(newLicenseId, keysArray)
          }
        }

        message.success('License created successfully')
      } else {
        await licenseService.updateLicense(selectedLicense.id, data)
        message.success('License updated successfully')
      }

      setModalOpen(false)
      form.resetFields()
      loadLicenses()
    } catch (error) {
      if (error.errorFields) return
      message.error(error.response?.data?.message || 'Operation failed')
    }
  }

  const handleTableChange = (newPagination) => {
    setPagination(prev => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    }))
  }

  // License Keys Management
  const loadLicenseKeys = async (licenseId) => {
    setKeysLoading(true)
    try {
      const response = await licenseService.getLicenseKeys(licenseId)
      if (response.data.success) {
        setLicenseKeys(response.data.data.keys || [])
      }
    } catch (error) {
      message.error('Failed to load license keys')
    } finally {
      setKeysLoading(false)
    }
  }

  const handleManageKeys = async (license) => {
    setSelectedLicense(license)
    await loadLicenseKeys(license.id)
    setKeysModalOpen(true)
  }

  const handleAddKeys = async () => {
    try {
      const values = await keysForm.validateFields()
      setAddingKeys(true)

      // Parse keys - support comma, newline, or semicolon separated
      const keysInput = values.license_keys || ''
      const keysArray = keysInput
        .split(/[,;\n]+/)
        .map(k => k.trim())
        .filter(k => k.length > 0)

      if (keysArray.length === 0) {
        message.error('Please enter at least one license key')
        return
      }

      const response = await licenseService.addLicenseKeys(selectedLicense.id, keysArray)
      if (response.data.success) {
        message.success(`Added ${response.data.data.added} license key(s)`)
        if (response.data.data.failed > 0) {
          message.warning(`${response.data.data.failed} key(s) failed to add`)
        }
        keysForm.resetFields()
        loadLicenseKeys(selectedLicense.id)
      }
    } catch (error) {
      if (error.errorFields) return
      message.error(error.response?.data?.message || 'Failed to add license keys')
    } finally {
      setAddingKeys(false)
    }
  }

  const handleDeleteKey = async (keyId) => {
    try {
      await licenseService.deleteLicenseKey(selectedLicense.id, keyId)
      message.success('License key deleted')
      loadLicenseKeys(selectedLicense.id)
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to delete license key')
    }
  }

  // Bulk Upload Functions
  const handleBulkUploadOpen = () => {
    setBulkUploadModalOpen(true)
    setBulkUploadStep('upload')
    setBulkUploadData([])
    setBulkUploadResult(null)
  }

  const handleBulkUploadClose = () => {
    // Check if we have successful uploads BEFORE resetting state
    const hasSuccessfulUploads = bulkUploadResult?.success?.length > 0

    setBulkUploadModalOpen(false)
    setBulkUploadStep('upload')
    setBulkUploadData([])
    setBulkUploadResult(null)

    // Refresh licenses table if any uploads succeeded
    if (hasSuccessfulUploads) {
      loadLicenses()
    }
  }

  const parseExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target.result
          const workbook = XLSX.read(arrayBuffer, { type: 'array' })

          // Get first sheet
          const sheetName = workbook.SheetNames[0]
          if (!sheetName) {
            reject(new Error('Excel file has no sheets'))
            return
          }

          const worksheet = workbook.Sheets[sheetName]

          // Convert to JSON with header row
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' })

          if (jsonData.length === 0) {
            reject(new Error('Excel file has no data rows'))
            return
          }

          // Column header mapping (Excel header -> API field)
          const headerMapping = {
            'product_name': 'product_name',
            'license_name': 'license_name',
            'license_type': 'license_type',
            'total_licenses': 'total_licenses',
            'license_key_(master)': 'license_key',
            'license_key_master': 'license_key',
            'license_key': 'license_key',
            'license_keys': 'license_keys',
            'vendor_name': 'vendor_name',
            'purchase_date': 'purchase_date',
            'expiration_date': 'expiration_date',
            'purchase_cost': 'purchase_cost',
            'support_end_date': 'support_end_date',
            'notes': 'notes'
          }

          // Normalize headers and process data
          const data = jsonData.map(row => {
            const normalizedRow = {}

            Object.keys(row).forEach(key => {
              // Normalize header: lowercase, replace spaces with underscores, remove parentheses
              const rawKey = key.toLowerCase().trim().replace(/\s+/g, '_').replace(/[()]/g, '')
              const normalizedKey = headerMapping[rawKey] || rawKey
              let value = row[key]

              // Handle license_keys which might be semicolon/newline separated
              if (normalizedKey === 'license_keys' && value) {
                if (typeof value === 'string') {
                  normalizedRow[normalizedKey] = value.split(/[;\n]+/).map(k => k.trim()).filter(k => k)
                } else {
                  normalizedRow[normalizedKey] = []
                }
              } else if (normalizedKey === 'total_licenses' || normalizedKey === 'purchase_cost') {
                normalizedRow[normalizedKey] = value !== '' ? parseFloat(value) : undefined
              } else if (normalizedKey === 'purchase_date' || normalizedKey === 'expiration_date' || normalizedKey === 'support_end_date') {
                // Handle Excel date serial numbers
                if (typeof value === 'number') {
                  const date = XLSX.SSF.parse_date_code(value)
                  if (date) {
                    normalizedRow[normalizedKey] = `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`
                  } else {
                    normalizedRow[normalizedKey] = value
                  }
                } else {
                  normalizedRow[normalizedKey] = value
                }
              } else {
                normalizedRow[normalizedKey] = typeof value === 'string' ? value.trim() : value
              }
            })

            return normalizedRow
          })

          resolve(data)
        } catch (error) {
          reject(new Error('Failed to parse Excel file: ' + error.message))
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsArrayBuffer(file)
    })
  }

  const handleFileUpload = async (file) => {
    const fileType = file.name.toLowerCase()
    try {
      let data
      if (fileType.endsWith('.xlsx') || fileType.endsWith('.xls')) {
        data = await parseExcelFile(file)
      } else {
        message.error('Please upload an Excel file (.xlsx or .xls)')
        return false
      }

      if (data.length === 0) {
        message.error('No valid license data found in file')
        return false
      }

      setBulkUploadData(data)
      setBulkUploadStep('preview')
      message.success(`Parsed ${data.length} license(s) from file`)
    } catch (error) {
      message.error(error.message || 'Failed to parse file')
    }
    return false // Prevent default upload behavior
  }

  const handleBulkUploadSubmit = async () => {
    if (bulkUploadData.length === 0) {
      message.error('No data to upload')
      return
    }

    setBulkUploading(true)
    try {
      const response = await licenseService.bulkUploadLicenses(bulkUploadData)
      if (response.data.success) {
        setBulkUploadResult(response.data.data)
        setBulkUploadStep('result')
        message.success(response.data.message)
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Bulk upload failed')
    } finally {
      setBulkUploading(false)
    }
  }

  const downloadTemplate = () => {
    // Create workbook with multiple sheets: Template, Instructions, and Reference sheets
    const workbook = XLSX.utils.book_new()

    // Main data template with sample rows
    const templateData = [
      {
        'Product Name': 'Microsoft Office 365',
        'License Name': 'Office 365 Enterprise E3 - Batch 1',
        'License Type': 'per_device',
        'Total Licenses': 3,
        'License Key (Master)': '',
        'License Keys': 'KEY1-XXXXX-XXXXX;KEY2-XXXXX-XXXXX;KEY3-XXXXX-XXXXX',
        'Vendor Name': 'Microsoft',
        'Purchase Date': '2024-01-15',
        'Expiration Date': '2025-01-15',
        'Purchase Cost': 50000,
        'Notes': 'Annual subscription - Per device licenses require individual keys'
      },
      {
        'Product Name': 'Adobe Creative Cloud',
        'License Name': 'Adobe CC Site License 2024',
        'License Type': 'site',
        'Total Licenses': 100,
        'License Key (Master)': 'MASTER-KEY-XXXXX-XXXXX-XXXXX',
        'License Keys': '',
        'Vendor Name': 'Adobe',
        'Purchase Date': '2024-01-01',
        'Expiration Date': '2024-12-31',
        'Purchase Cost': 500000,
        'Notes': 'Site license uses master key for all installations'
      }
    ]

    const templateSheet = XLSX.utils.json_to_sheet(templateData)

    // Set column widths
    templateSheet['!cols'] = [
      { wch: 25 }, // Product Name
      { wch: 35 }, // License Name
      { wch: 12 }, // License Type
      { wch: 14 }, // Total Licenses
      { wch: 30 }, // License Key (Master)
      { wch: 50 }, // License Keys
      { wch: 15 }, // Vendor Name
      { wch: 14 }, // Purchase Date
      { wch: 14 }, // Expiration Date
      { wch: 14 }, // Purchase Cost
      { wch: 40 }  // Notes
    ]

    XLSX.utils.book_append_sheet(workbook, templateSheet, 'Licenses')

    // Instructions sheet
    const instructionsData = [
      { 'Field': 'Product Name', 'Required': 'Yes', 'Description': 'Name of the software product. Use "Product Name - Model" format if multiple products have the same name (see "Software Products" sheet)' },
      { 'Field': 'License Name', 'Required': 'Yes', 'Description': 'Unique name/identifier for this license pool' },
      { 'Field': 'License Type', 'Required': 'Yes', 'Description': 'per_user, per_device, concurrent, site, or volume (see "License Types" sheet)' },
      { 'Field': 'Total Licenses', 'Required': 'Yes', 'Description': 'Number of licenses purchased' },
      { 'Field': 'License Key (Master)', 'Required': 'For site/volume/concurrent', 'Description': 'Single shared key for site/volume/concurrent licenses' },
      { 'Field': 'License Keys', 'Required': 'For per_user/per_device', 'Description': 'Individual keys separated by semicolons (;). Count must match Total Licenses' },
      { 'Field': 'Vendor Name', 'Required': 'No', 'Description': 'Vendor/supplier name (must exist in system - see "Vendors" sheet for available options)' },
      { 'Field': 'Purchase Date', 'Required': 'No', 'Description': 'Date of purchase (YYYY-MM-DD format)' },
      { 'Field': 'Expiration Date', 'Required': 'No', 'Description': 'License expiration date (YYYY-MM-DD format)' },
      { 'Field': 'Purchase Cost', 'Required': 'No', 'Description': 'Total purchase cost in INR' },
      { 'Field': 'Notes', 'Required': 'No', 'Description': 'Additional notes or comments' },
      { 'Field': '', 'Required': '', 'Description': '' },
      { 'Field': 'REFERENCE SHEETS:', 'Required': '', 'Description': '' },
      { 'Field': 'Software Products', 'Required': '', 'Description': 'List of available software products - copy value from "Product Name (for upload)" column' },
      { 'Field': 'Vendors', 'Required': '', 'Description': 'List of available vendors in the system - use exact Vendor Name' },
      { 'Field': 'License Types', 'Required': '', 'Description': 'Valid license type values with descriptions' }
    ]

    const instructionsSheet = XLSX.utils.json_to_sheet(instructionsData)
    instructionsSheet['!cols'] = [
      { wch: 25 },
      { wch: 25 },
      { wch: 80 }
    ]

    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions')

    // Software Products Reference Sheet
    // Include a "Product Name (for upload)" column that users should copy directly
    const softwareProductsData = products.length > 0
      ? products.map((p, idx) => {
          // Create the upload-friendly name: "Name - Model" if model exists, otherwise just "Name"
          const uploadName = p.model ? `${p.name} - ${p.model}` : p.name
          return {
            '#': idx + 1,
            'Product Name (for upload)': uploadName,
            'Product Name': p.name,
            'Model': p.model || '',
            'Manufacturer/OEM': p.oem_name || '',
            'Category': p.category_name || 'Software'
          }
        })
      : [{ '#': 1, 'Product Name (for upload)': 'No software products found', 'Product Name': '', 'Model': '', 'Manufacturer/OEM': '', 'Category': '' }]

    const softwareProductsSheet = XLSX.utils.json_to_sheet(softwareProductsData)
    softwareProductsSheet['!cols'] = [
      { wch: 5 },   // #
      { wch: 45 },  // Product Name (for upload)
      { wch: 30 },  // Product Name
      { wch: 20 },  // Model
      { wch: 25 },  // Manufacturer/OEM
      { wch: 15 }   // Category
    ]

    XLSX.utils.book_append_sheet(workbook, softwareProductsSheet, 'Software Products')

    // Vendors Reference Sheet
    const vendorsData = vendors.length > 0
      ? vendors.map((v, idx) => ({
          '#': idx + 1,
          'Vendor Name': v.name,
          'Contact Person': v.contact_person || '',
          'Email': v.email || '',
          'Phone': v.phone || ''
        }))
      : [{ '#': 1, 'Vendor Name': 'No vendors found', 'Contact Person': '', 'Email': '', 'Phone': '' }]

    const vendorsSheet = XLSX.utils.json_to_sheet(vendorsData)
    vendorsSheet['!cols'] = [
      { wch: 5 },   // #
      { wch: 35 },  // Vendor Name
      { wch: 25 },  // Contact Person
      { wch: 30 },  // Email
      { wch: 15 }   // Phone
    ]

    XLSX.utils.book_append_sheet(workbook, vendorsSheet, 'Vendors')

    // License Types Reference Sheet
    const licenseTypesData = [
      { 'License Type': 'per_user', 'Display Name': 'Per User', 'Key Requirement': 'Individual Keys Required', 'Description': 'One license is consumed per user. Each user needs their own unique license key.' },
      { 'License Type': 'per_device', 'Display Name': 'Per Device', 'Key Requirement': 'Individual Keys Required', 'Description': 'One license is consumed per device/asset. Each device needs its own unique license key.' },
      { 'License Type': 'site', 'Display Name': 'Site License', 'Key Requirement': 'Master Key Only', 'Description': 'Site-wide license that allows unlimited installations within the organization. Uses a single master key.' },
      { 'License Type': 'volume', 'Display Name': 'Volume License', 'Key Requirement': 'Master Key Only', 'Description': 'Volume licensing allows a specified number of installations using a single master key.' },
      { 'License Type': 'concurrent', 'Display Name': 'Concurrent', 'Key Requirement': 'Master Key Only', 'Description': 'Allows a specified number of simultaneous users. Uses a single master key for all installations.' }
    ]

    const licenseTypesSheet = XLSX.utils.json_to_sheet(licenseTypesData)
    licenseTypesSheet['!cols'] = [
      { wch: 15 },  // License Type
      { wch: 15 },  // Display Name
      { wch: 25 },  // Key Requirement
      { wch: 80 }   // Description
    ]

    XLSX.utils.book_append_sheet(workbook, licenseTypesSheet, 'License Types')

    // Generate and download
    XLSX.writeFile(workbook, 'license_bulk_upload_template.xlsx')
    message.success('Excel template downloaded with reference sheets')
  }

  const exportUtilizationReport = () => {
    if (!reportData.licenses || reportData.licenses.length === 0) {
      message.warning('No data to export')
      return
    }

    const workbook = XLSX.utils.book_new()

    // Utilization Report Data
    const reportExportData = reportData.licenses.map((license, idx) => ({
      '#': idx + 1,
      'License Name': license.license_name,
      'Software Product': license.product_name,
      'Model': license.product_model || '',
      'Manufacturer': license.oem_name || '',
      'Vendor': license.vendor_name || '',
      'License Type': licenseService.getLicenseTypeLabel(license.license_type),
      'Purchased': license.purchased,
      'Allocated': license.allocated,
      'Available': license.available,
      'Utilization %': license.utilization_percent,
      'Status': license.allocated > license.purchased ? 'Over-Allocated' :
                license.utilization_percent >= 90 ? 'Critical' :
                license.utilization_percent >= 75 ? 'Warning' : 'Healthy',
      'Purchase Date': license.purchase_date ? dayjs(license.purchase_date).format('YYYY-MM-DD') : '',
      'Expiration Date': license.expiration_date ? dayjs(license.expiration_date).format('YYYY-MM-DD') : 'Perpetual',
      'Expiring Soon': license.expiration_date && licenseService.isExpiringSoon(license.expiration_date) ? 'Yes' : 'No'
    }))

    const reportSheet = XLSX.utils.json_to_sheet(reportExportData)
    reportSheet['!cols'] = [
      { wch: 5 },   // #
      { wch: 35 },  // License Name
      { wch: 25 },  // Software Product
      { wch: 15 },  // Model
      { wch: 20 },  // Manufacturer
      { wch: 20 },  // Vendor
      { wch: 15 },  // License Type
      { wch: 12 },  // Purchased
      { wch: 12 },  // Allocated
      { wch: 12 },  // Available
      { wch: 14 },  // Utilization %
      { wch: 14 },  // Status
      { wch: 14 },  // Purchase Date
      { wch: 14 },  // Expiration Date
      { wch: 14 }   // Expiring Soon
    ]
    XLSX.utils.book_append_sheet(workbook, reportSheet, 'Utilization Report')

    // Summary Sheet
    const summaryData = [
      { 'Metric': 'Report Generated', 'Value': dayjs().format('YYYY-MM-DD HH:mm:ss') },
      { 'Metric': '', 'Value': '' },
      { 'Metric': 'Total License Pools', 'Value': reportData.summary?.total_licenses || 0 },
      { 'Metric': 'Total Purchased', 'Value': reportData.summary?.total_purchased || 0 },
      { 'Metric': 'Total Allocated', 'Value': reportData.summary?.total_allocated || 0 },
      { 'Metric': 'Total Available', 'Value': reportData.summary?.total_available || 0 },
      { 'Metric': 'Average Utilization', 'Value': `${reportData.summary?.average_utilization || 0}%` },
      { 'Metric': '', 'Value': '' },
      { 'Metric': 'Expiring Soon (30 days)', 'Value': reportData.summary?.expiring_soon || 0 },
      { 'Metric': 'Over-Allocated', 'Value': reportData.summary?.over_allocated || 0 }
    ]

    const summarySheet = XLSX.utils.json_to_sheet(summaryData)
    summarySheet['!cols'] = [
      { wch: 25 },
      { wch: 25 }
    ]
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

    // Generate filename with date
    const filename = `license_utilization_report_${dayjs().format('YYYY-MM-DD')}.xlsx`
    XLSX.writeFile(workbook, filename)
    message.success('Utilization report exported successfully')
  }

  // Export License Usage Analytics (Purchased vs Peak Usage - Monthly/Quarterly)
  const exportUsageAnalytics = async (period = 'monthly') => {
    try {
      message.loading({ content: 'Generating usage analytics report...', key: 'usageExport' })

      const response = await licenseService.getUsageAnalytics({ period, months: 12 })
      if (!response.data.success || !response.data.data.licenses || response.data.data.licenses.length === 0) {
        message.warning({ content: 'No usage data available', key: 'usageExport' })
        return
      }

      const data = response.data.data
      const workbook = XLSX.utils.book_new()

      // Main analytics data
      const analyticsData = data.licenses.map((license, idx) => ({
        '#': idx + 1,
        'License Name': license.license_name,
        'Software Product': license.product_name,
        'Model': license.product_model || '',
        'Manufacturer': license.oem_name || '',
        'License Type': licenseService.getLicenseTypeLabel(license.license_type),
        'Purchased': license.purchased,
        'Current Allocated': license.current_allocated,
        'Peak Usage': license.peak_usage,
        'Utilization %': license.utilization_percent,
        'Status': license.peak_usage > license.purchased ? 'Over-Utilized' :
                  license.utilization_percent < 50 ? 'Under-Utilized' : 'Optimal',
        'Purchase Date': license.purchase_date ? dayjs(license.purchase_date).format('YYYY-MM-DD') : '',
        'Expiration Date': license.expiration_date ? dayjs(license.expiration_date).format('YYYY-MM-DD') : 'Perpetual'
      }))

      const analyticsSheet = XLSX.utils.json_to_sheet(analyticsData)
      analyticsSheet['!cols'] = [
        { wch: 5 },   // #
        { wch: 35 },  // License Name
        { wch: 25 },  // Software Product
        { wch: 15 },  // Model
        { wch: 20 },  // Manufacturer
        { wch: 15 },  // License Type
        { wch: 12 },  // Purchased
        { wch: 16 },  // Current Allocated
        { wch: 12 },  // Peak Usage
        { wch: 14 },  // Utilization %
        { wch: 14 },  // Status
        { wch: 14 },  // Purchase Date
        { wch: 14 }   // Expiration Date
      ]
      XLSX.utils.book_append_sheet(workbook, analyticsSheet, `${period === 'quarterly' ? 'Quarterly' : 'Monthly'} Analytics`)

      // Summary Sheet
      const summaryData = [
        { 'Metric': 'Report Generated', 'Value': dayjs().format('YYYY-MM-DD HH:mm:ss') },
        { 'Metric': 'Period Type', 'Value': period === 'quarterly' ? 'Quarterly' : 'Monthly' },
        { 'Metric': 'Analysis Period', 'Value': 'Last 12 months' },
        { 'Metric': '', 'Value': '' },
        { 'Metric': 'Total License Pools', 'Value': data.summary?.total_licenses || 0 },
        { 'Metric': 'Total Purchased', 'Value': data.summary?.total_purchased || 0 },
        { 'Metric': 'Total Peak Usage', 'Value': data.summary?.total_peak_usage || 0 },
        { 'Metric': 'Total Current Allocated', 'Value': data.summary?.total_current_allocated || 0 },
        { 'Metric': '', 'Value': '' },
        { 'Metric': 'Over-Utilized (Peak > Purchased)', 'Value': data.summary?.over_utilized || 0 },
        { 'Metric': 'Under-Utilized (<50%)', 'Value': data.summary?.under_utilized || 0 }
      ]

      const summarySheet = XLSX.utils.json_to_sheet(summaryData)
      summarySheet['!cols'] = [{ wch: 35 }, { wch: 25 }]
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

      const filename = `license_usage_analytics_${period}_${dayjs().format('YYYY-MM-DD')}.xlsx`
      XLSX.writeFile(workbook, filename)
      message.success({ content: `${period === 'quarterly' ? 'Quarterly' : 'Monthly'} usage analytics exported`, key: 'usageExport' })
    } catch (error) {
      message.error({ content: 'Failed to export usage analytics', key: 'usageExport' })
    }
  }

  // Export Expiration Alerts (Warranty, EOL, EOS, License Expiration)
  const exportExpirationAlerts = async (daysThreshold = 90) => {
    try {
      message.loading({ content: 'Generating expiration alerts report...', key: 'expirationExport' })

      const response = await licenseService.getExpirationAlerts({ days: daysThreshold, type: 'all' })
      if (!response.data.success) {
        message.warning({ content: 'No expiration data available', key: 'expirationExport' })
        return
      }

      const data = response.data.data
      const workbook = XLSX.utils.book_new()

      // Warranty Expiring Sheet
      if (data.alerts.warranty_expiring && data.alerts.warranty_expiring.length > 0) {
        const warrantyData = data.alerts.warranty_expiring.map((item, idx) => ({
          '#': idx + 1,
          'Asset Tag': item.asset_tag,
          'Serial Number': item.serial_number || '',
          'Product': item.product_name,
          'Model': item.product_model || '',
          'Manufacturer': item.oem_name || '',
          'Warranty End Date': item.warranty_end_date ? dayjs(item.warranty_end_date).format('YYYY-MM-DD') : '',
          'Days Remaining': item.days_remaining,
          'Urgency': item.days_remaining <= 30 ? 'Critical' : item.days_remaining <= 60 ? 'Warning' : 'Approaching',
          'Assigned To': item.assigned_to || '',
          'Location': item.location_name || ''
        }))
        const warrantySheet = XLSX.utils.json_to_sheet(warrantyData)
        warrantySheet['!cols'] = [
          { wch: 5 }, { wch: 15 }, { wch: 18 }, { wch: 25 }, { wch: 15 },
          { wch: 18 }, { wch: 16 }, { wch: 14 }, { wch: 10 }, { wch: 20 }, { wch: 20 }
        ]
        XLSX.utils.book_append_sheet(workbook, warrantySheet, 'Warranty Expiring')
      }

      // EOL Approaching Sheet
      if (data.alerts.eol_approaching && data.alerts.eol_approaching.length > 0) {
        const eolData = data.alerts.eol_approaching.map((item, idx) => ({
          '#': idx + 1,
          'Asset Tag': item.asset_tag,
          'Serial Number': item.serial_number || '',
          'Product': item.product_name,
          'Model': item.product_model || '',
          'Manufacturer': item.oem_name || '',
          'EOL Date': item.eol_date ? dayjs(item.eol_date).format('YYYY-MM-DD') : '',
          'Days Remaining': item.days_remaining,
          'Urgency': item.days_remaining <= 30 ? 'Critical' : item.days_remaining <= 60 ? 'Warning' : 'Approaching',
          'Assigned To': item.assigned_to || '',
          'Location': item.location_name || ''
        }))
        const eolSheet = XLSX.utils.json_to_sheet(eolData)
        eolSheet['!cols'] = [
          { wch: 5 }, { wch: 15 }, { wch: 18 }, { wch: 25 }, { wch: 15 },
          { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 20 }, { wch: 20 }
        ]
        XLSX.utils.book_append_sheet(workbook, eolSheet, 'EOL Approaching')
      }

      // EOS Approaching Sheet (End of Support / EOSL)
      if (data.alerts.eos_approaching && data.alerts.eos_approaching.length > 0) {
        const eosData = data.alerts.eos_approaching.map((item, idx) => ({
          '#': idx + 1,
          'Asset Tag': item.asset_tag,
          'Serial Number': item.serial_number || '',
          'Product': item.product_name,
          'Model': item.product_model || '',
          'Manufacturer': item.oem_name || '',
          'EOS Date': item.eos_date ? dayjs(item.eos_date).format('YYYY-MM-DD') : '',
          'Days Remaining': item.days_remaining,
          'Urgency': item.days_remaining <= 30 ? 'Critical' : item.days_remaining <= 60 ? 'Warning' : 'Approaching',
          'Assigned To': item.assigned_to || '',
          'Location': item.location_name || ''
        }))
        const eosSheet = XLSX.utils.json_to_sheet(eosData)
        eosSheet['!cols'] = [
          { wch: 5 }, { wch: 15 }, { wch: 18 }, { wch: 25 }, { wch: 15 },
          { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 20 }, { wch: 20 }
        ]
        XLSX.utils.book_append_sheet(workbook, eosSheet, 'EOS-EOSL Approaching')
      }

      // License Expiring Sheet
      if (data.alerts.license_expiring && data.alerts.license_expiring.length > 0) {
        const licenseData = data.alerts.license_expiring.map((item, idx) => ({
          '#': idx + 1,
          'License Name': item.license_name,
          'Software Product': item.product_name,
          'Model': item.product_model || '',
          'Manufacturer': item.oem_name || '',
          'Vendor': item.vendor_name || '',
          'License Type': licenseService.getLicenseTypeLabel(item.license_type),
          'Purchased': item.purchased,
          'Allocated': item.allocated,
          'Expiration Date': item.expiration_date ? dayjs(item.expiration_date).format('YYYY-MM-DD') : '',
          'Days Remaining': item.days_remaining,
          'Urgency': item.days_remaining <= 30 ? 'Critical' : item.days_remaining <= 60 ? 'Warning' : 'Approaching'
        }))
        const licenseSheet = XLSX.utils.json_to_sheet(licenseData)
        licenseSheet['!cols'] = [
          { wch: 5 }, { wch: 30 }, { wch: 25 }, { wch: 15 }, { wch: 18 },
          { wch: 18 }, { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 10 }
        ]
        XLSX.utils.book_append_sheet(workbook, licenseSheet, 'License Expiring')
      }

      // Support Ending Sheet
      if (data.alerts.support_ending && data.alerts.support_ending.length > 0) {
        const supportData = data.alerts.support_ending.map((item, idx) => ({
          '#': idx + 1,
          'License Name': item.license_name,
          'Software Product': item.product_name,
          'Model': item.product_model || '',
          'Manufacturer': item.oem_name || '',
          'Vendor': item.vendor_name || '',
          'License Type': licenseService.getLicenseTypeLabel(item.license_type),
          'Purchased': item.purchased,
          'Allocated': item.allocated,
          'Support End Date': item.support_end_date ? dayjs(item.support_end_date).format('YYYY-MM-DD') : '',
          'Days Remaining': item.days_remaining,
          'Urgency': item.days_remaining <= 30 ? 'Critical' : item.days_remaining <= 60 ? 'Warning' : 'Approaching'
        }))
        const supportSheet = XLSX.utils.json_to_sheet(supportData)
        supportSheet['!cols'] = [
          { wch: 5 }, { wch: 30 }, { wch: 25 }, { wch: 15 }, { wch: 18 },
          { wch: 18 }, { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 16 }, { wch: 14 }, { wch: 10 }
        ]
        XLSX.utils.book_append_sheet(workbook, supportSheet, 'Support Ending')
      }

      // Summary Sheet
      const summaryData = [
        { 'Metric': 'Report Generated', 'Value': dayjs().format('YYYY-MM-DD HH:mm:ss') },
        { 'Metric': 'Alert Threshold', 'Value': `${daysThreshold} days` },
        { 'Metric': '', 'Value': '' },
        { 'Metric': 'EXPIRATION ALERTS SUMMARY', 'Value': '' },
        { 'Metric': '', 'Value': '' },
        { 'Metric': 'Warranty Expiring', 'Value': data.summary?.warranty_count || 0 },
        { 'Metric': '  - Critical (≤30 days)', 'Value': data.summary?.critical_30_days?.warranty || 0 },
        { 'Metric': '', 'Value': '' },
        { 'Metric': 'EOL Approaching', 'Value': data.summary?.eol_count || 0 },
        { 'Metric': '  - Critical (≤30 days)', 'Value': data.summary?.critical_30_days?.eol || 0 },
        { 'Metric': '', 'Value': '' },
        { 'Metric': 'EOS/EOSL Approaching', 'Value': data.summary?.eos_count || 0 },
        { 'Metric': '  - Critical (≤30 days)', 'Value': data.summary?.critical_30_days?.eos || 0 },
        { 'Metric': '', 'Value': '' },
        { 'Metric': 'License Expiring', 'Value': data.summary?.license_count || 0 },
        { 'Metric': '  - Critical (≤30 days)', 'Value': data.summary?.critical_30_days?.license || 0 },
        { 'Metric': '', 'Value': '' },
        { 'Metric': 'Support Ending', 'Value': data.summary?.support_count || 0 },
        { 'Metric': '  - Critical (≤30 days)', 'Value': data.summary?.critical_30_days?.support || 0 },
        { 'Metric': '', 'Value': '' },
        { 'Metric': 'TOTAL ALERTS', 'Value': data.summary?.total_alerts || 0 }
      ]

      const summarySheet = XLSX.utils.json_to_sheet(summaryData)
      summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }]
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

      const filename = `expiration_alerts_${daysThreshold}days_${dayjs().format('YYYY-MM-DD')}.xlsx`
      XLSX.writeFile(workbook, filename)
      message.success({ content: 'Expiration alerts report exported', key: 'expirationExport' })
    } catch (error) {
      message.error({ content: 'Failed to export expiration alerts', key: 'expirationExport' })
    }
  }

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 50,
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1
    },
    {
      title: 'License Name',
      dataIndex: 'license_name',
      key: 'license_name',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.product_name}</Text>
        </Space>
      )
    },
    {
      title: 'Type',
      dataIndex: 'license_type',
      key: 'license_type',
      width: 120,
      render: (type) => (
        <Tag color={licenseService.getLicenseTypeColor(type)}>
          {licenseService.getLicenseTypeLabel(type)}
        </Tag>
      )
    },
    {
      title: 'Utilization',
      key: 'utilization',
      width: 180,
      render: (_, record) => {
        const allocated = record.allocated_count || 0
        const total = record.total_licenses || 0
        const percent = total > 0 ? Math.round((allocated / total) * 100) : 0
        return (
          <Space direction="vertical" size={0} style={{ width: '100%' }}>
            <Text>{allocated} / {total}</Text>
            <Progress
              percent={percent}
              size="small"
              strokeColor={licenseService.getUtilizationColor(percent)}
              showInfo={false}
            />
          </Space>
        )
      }
    },
    {
      title: 'Expiration',
      dataIndex: 'expiration_date',
      key: 'expiration_date',
      width: 120,
      render: (date) => {
        if (!date) return <Text type="secondary">Perpetual</Text>
        const isExpired = licenseService.isExpired(date)
        const isExpiringSoon = licenseService.isExpiringSoon(date)
        return (
          <Space>
            {isExpired && <WarningOutlined style={{ color: '#ff4d4f' }} />}
            {isExpiringSoon && !isExpired && <ExclamationCircleOutlined style={{ color: '#faad14' }} />}
            <Text type={isExpired ? 'danger' : isExpiringSoon ? 'warning' : undefined}>
              {dayjs(date).format('DD/MM/YYYY')}
            </Text>
          </Space>
        )
      }
    },
    {
      title: 'Vendor',
      dataIndex: 'vendor_name',
      key: 'vendor_name',
      width: 120,
      render: (text) => text || '-'
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (_, record) => {
        if (!record.is_active) {
          return <Tag color="default">Inactive</Tag>
        }

        // Check if keys are ready
        const hasMasterKey = record.license_key && record.license_key.trim().length > 0
        const hasAllKeys = (record.keys_count || 0) >= record.total_licenses
        const isMasterKeyType = ['site', 'volume', 'concurrent'].includes(record.license_type)
        const isReady = isMasterKeyType ? (hasMasterKey || hasAllKeys) : hasAllKeys

        if (!isReady) {
          const keysMissing = record.total_licenses - (record.keys_count || 0)
          return (
            <Tooltip title={`${keysMissing} license key(s) need to be added before allocation`}>
              <Tag color="warning" icon={<WarningOutlined />}>Keys Missing</Tag>
            </Tooltip>
          )
        }

        return <Tag color="success">Ready</Tag>
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
          </Tooltip>
          <Tooltip title="Manage Keys">
            <Button type="text" size="small" icon={<KeyOutlined />} onClick={() => handleManageKeys(record)} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Delete this license?"
            description="This will deactivate the license if it has installations."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const reportColumns = [
    {
      title: 'Software',
      dataIndex: 'product_name',
      key: 'product_name',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.license_name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{text}</Text>
          {record.oem_name && <Text type="secondary" style={{ fontSize: 11 }}>{record.oem_name}</Text>}
        </Space>
      )
    },
    {
      title: 'License Type',
      dataIndex: 'license_type',
      key: 'license_type',
      width: 120,
      render: (type) => (
        <Tag color={licenseService.getLicenseTypeColor(type)}>
          {licenseService.getLicenseTypeLabel(type)}
        </Tag>
      )
    },
    {
      title: 'Purchased',
      dataIndex: 'purchased',
      key: 'purchased',
      width: 100,
      align: 'center',
      render: (val) => <Text strong>{val}</Text>
    },
    {
      title: 'Allocated',
      dataIndex: 'allocated',
      key: 'allocated',
      width: 100,
      align: 'center',
      render: (val) => <Text>{val}</Text>
    },
    {
      title: 'Available',
      dataIndex: 'available',
      key: 'available',
      width: 100,
      align: 'center',
      render: (val) => (
        <Text type={val <= 0 ? 'danger' : val <= 5 ? 'warning' : 'success'}>{val}</Text>
      )
    },
    {
      title: 'Utilization',
      dataIndex: 'utilization_percent',
      key: 'utilization_percent',
      width: 150,
      render: (percent) => (
        <Progress
          percent={percent}
          size="small"
          strokeColor={licenseService.getUtilizationColor(percent)}
          format={(p) => `${p}%`}
        />
      )
    },
    {
      title: 'Expiration',
      dataIndex: 'expiration_date',
      key: 'expiration_date',
      width: 110,
      render: (date) => {
        if (!date) return <Text type="secondary">Perpetual</Text>
        const isExpiringSoon = licenseService.isExpiringSoon(date)
        return (
          <Text type={isExpiringSoon ? 'warning' : undefined}>
            {dayjs(date).format('DD/MM/YYYY')}
          </Text>
        )
      }
    }
  ]

  const tabItems = [
    {
      key: 'licenses',
      label: (
        <span>
          <SafetyCertificateOutlined /> Licenses
        </span>
      ),
      children: (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Space>
              <Search
                placeholder="Search licenses..."
                allowClear
                style={{ width: 250 }}
                onSearch={(value) => setFilters(prev => ({ ...prev, search: value }))}
              />
              <Select
                placeholder="License Type"
                allowClear
                style={{ width: 150 }}
                onChange={(value) => setFilters(prev => ({ ...prev, license_type: value }))}
              >
                <Option value="per_user">Per User</Option>
                <Option value="per_device">Per Device</Option>
                <Option value="concurrent">Concurrent</Option>
                <Option value="site">Site License</Option>
                <Option value="volume">Volume License</Option>
              </Select>
              <Select
                placeholder="Status"
                allowClear
                style={{ width: 120 }}
                onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Space>
            <Space>
              <Button icon={<UploadOutlined />} onClick={handleBulkUploadOpen}>
                Bulk Upload
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                Add License
              </Button>
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={licenses}
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} licenses`
            }}
            onChange={handleTableChange}
          />
        </>
      )
    },
    {
      key: 'report',
      label: (
        <span>
          <BarChartOutlined /> Utilization Report
        </span>
      ),
      children: (
        <>
          {/* Export Buttons */}
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Space>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'utilization',
                      label: 'Current Utilization Report',
                      onClick: exportUtilizationReport
                    },
                    { type: 'divider' },
                    {
                      key: 'usage-monthly',
                      label: 'Usage Analytics (Monthly)',
                      onClick: () => exportUsageAnalytics('monthly')
                    },
                    {
                      key: 'usage-quarterly',
                      label: 'Usage Analytics (Quarterly)',
                      onClick: () => exportUsageAnalytics('quarterly')
                    },
                    { type: 'divider' },
                    {
                      key: 'expiration-30',
                      label: 'Expiration Alerts (30 days)',
                      onClick: () => exportExpirationAlerts(30)
                    },
                    {
                      key: 'expiration-60',
                      label: 'Expiration Alerts (60 days)',
                      onClick: () => exportExpirationAlerts(60)
                    },
                    {
                      key: 'expiration-90',
                      label: 'Expiration Alerts (90 days)',
                      onClick: () => exportExpirationAlerts(90)
                    }
                  ]
                }}
              >
                <Button type="primary" icon={<DownloadOutlined />}>
                  Export Reports
                </Button>
              </Dropdown>
            </Space>
          </div>

          {/* Summary Cards */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={4}>
              <Card size="small">
                <Statistic
                  title="Total Licenses"
                  value={reportData.summary?.total_licenses || 0}
                  prefix={<SafetyCertificateOutlined style={{ color: '#1890ff' }} />}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card size="small">
                <Statistic
                  title="Purchased"
                  value={reportData.summary?.total_purchased || 0}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card size="small">
                <Statistic
                  title="Allocated"
                  value={reportData.summary?.total_allocated || 0}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card size="small">
                <Statistic
                  title="Available"
                  value={reportData.summary?.total_available || 0}
                  valueStyle={{ color: reportData.summary?.total_available > 0 ? '#52c41a' : '#ff4d4f' }}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card size="small">
                <Statistic
                  title="Avg Utilization"
                  value={reportData.summary?.average_utilization || 0}
                  suffix="%"
                  valueStyle={{ color: licenseService.getUtilizationColor(reportData.summary?.average_utilization) }}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card size="small">
                <Statistic
                  title="Expiring Soon"
                  value={reportData.summary?.expiring_soon || 0}
                  valueStyle={{ color: reportData.summary?.expiring_soon > 0 ? '#faad14' : undefined }}
                  prefix={<WarningOutlined style={{ color: '#faad14' }} />}
                />
              </Card>
            </Col>
          </Row>

          {reportData.summary?.over_allocated > 0 && (
            <Alert
              message={`${reportData.summary.over_allocated} license(s) are over-allocated`}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Table
            columns={reportColumns}
            dataSource={reportData.licenses || []}
            rowKey="id"
            loading={reportLoading}
            pagination={false}
          />
        </>
      )
    }
  ]

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ marginBottom: 16 }}>
        <SafetyCertificateOutlined /> Software License Management
      </Title>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={modalMode === 'create' ? 'Add New License' : 'Edit License'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          form.resetFields()
        }}
        onOk={handleSubmit}
        okText={modalMode === 'create' ? 'Create' : 'Update'}
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="product_id"
            label="Software Product"
            rules={[{ required: true, message: 'Please select a software product' }]}
          >
            <Select
              placeholder="Select software product"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children ?? '').toString().toLowerCase().includes(input.toLowerCase())
              }
              disabled={modalMode === 'edit'}
            >
              {products.map(p => (
                <Option key={p.id} value={p.id}>
                  {p.name}{p.model ? ` - ${p.model}` : ''}{p.oem_name ? ` (${p.oem_name})` : ''}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="license_name"
            label="License Name"
            rules={[{ required: true, message: 'Please enter license name' }]}
          >
            <Input placeholder="e.g., Microsoft Office 365 Enterprise E3" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="license_type"
                label="License Type"
                rules={[{ required: true, message: 'Please select license type' }]}
              >
                <Select placeholder="Select type">
                  <Option value="per_user">Per User</Option>
                  <Option value="per_device">Per Device</Option>
                  <Option value="concurrent">Concurrent</Option>
                  <Option value="site">Site License</Option>
                  <Option value="volume">Volume License</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="total_licenses"
                label="Total Licenses (Purchased)"
                rules={[{ required: true, message: 'Please enter total licenses' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.license_type !== currentValues.license_type ||
              prevValues.total_licenses !== currentValues.total_licenses
            }
          >
            {({ getFieldValue }) => {
              const licenseType = getFieldValue('license_type')
              const totalLicenses = getFieldValue('total_licenses') || 0
              const isMasterKeyType = ['site', 'volume', 'concurrent'].includes(licenseType)

              if (isMasterKeyType) {
                return (
                  <Form.Item
                    name="license_key"
                    label="Master License Key"
                    tooltip="A single shared key used for all installations under this license"
                    rules={[{ required: true, message: 'Master license key is required for this license type' }]}
                  >
                    <Input.Password placeholder="Enter master license key (shared across all installations)" />
                  </Form.Item>
                )
              }

              // For per_user/per_device - show bulk license keys input (only in create mode)
              if (modalMode === 'create' && licenseType && totalLicenses > 0) {
                return (
                  <Form.Item
                    name="license_keys_bulk"
                    label={`License Keys (${totalLicenses} required)`}
                    tooltip={`Enter exactly ${totalLicenses} license key(s) - one per line or separated by commas/semicolons`}
                    rules={[{ required: true, message: `Please enter all ${totalLicenses} license keys` }]}
                    extra={
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Enter one key per line, or separate with commas/semicolons. Must provide exactly {totalLicenses} key(s).
                      </Text>
                    }
                  >
                    <Input.TextArea
                      rows={Math.min(totalLicenses, 6)}
                      placeholder={`XXXXX-XXXXX-XXXXX-XXXXX\nYYYYY-YYYYY-YYYYY-YYYYY\n...`}
                    />
                  </Form.Item>
                )
              }

              return null
            }}
          </Form.Item>

          <Form.Item name="vendor_id" label="Vendor">
            <Select placeholder="Select vendor" allowClear showSearch filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }>
              {vendors.map(v => (
                <Option key={v.id} value={v.id}>{v.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="purchase_date" label="Purchase Date">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="expiration_date" label="Expiration Date">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="support_end_date" label="Support End Date">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="purchase_cost" label="Purchase Cost (₹)">
            <InputNumber
              min={0}
              precision={2}
              style={{ width: '100%' }}
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/₹\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} placeholder="Additional notes (optional)" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Details Drawer */}
      <Drawer
        title="License Details"
        placement="right"
        width={600}
        onClose={() => setDetailDrawerOpen(false)}
        open={detailDrawerOpen}
      >
        {selectedLicense && (
          <>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="License Name" span={2}>
                <Text strong>{selectedLicense.license_name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Product">
                {selectedLicense.product_name}
              </Descriptions.Item>
              <Descriptions.Item label="OEM">
                {selectedLicense.oem_name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Type">
                <Tag color={licenseService.getLicenseTypeColor(selectedLicense.license_type)}>
                  {licenseService.getLicenseTypeLabel(selectedLicense.license_type)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={selectedLicense.is_active ? 'success' : 'default'}>
                  {selectedLicense.is_active ? 'Active' : 'Inactive'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Purchased">
                <Text strong style={{ fontSize: 16 }}>{selectedLicense.total_licenses}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Allocated">
                <Text style={{ fontSize: 16 }}>{selectedLicense.allocated_count || 0}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Available" span={2}>
                <Text type={selectedLicense.available_count > 0 ? 'success' : 'danger'} style={{ fontSize: 16 }}>
                  {selectedLicense.available_count || 0}
                </Text>
              </Descriptions.Item>
              {selectedLicense.license_key && (
                <Descriptions.Item label="License Key" span={2}>
                  <Text code copyable>{selectedLicense.license_key}</Text>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Vendor">{selectedLicense.vendor_name || '-'}</Descriptions.Item>
              <Descriptions.Item label="Purchase Cost">
                {selectedLicense.purchase_cost ? `₹${selectedLicense.purchase_cost.toLocaleString('en-IN')}` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Purchase Date">
                {selectedLicense.purchase_date ? dayjs(selectedLicense.purchase_date).format('DD/MM/YYYY') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Expiration Date">
                {selectedLicense.expiration_date ? (
                  <Text type={licenseService.isExpiringSoon(selectedLicense.expiration_date) ? 'warning' : undefined}>
                    {dayjs(selectedLicense.expiration_date).format('DD/MM/YYYY')}
                  </Text>
                ) : 'Perpetual'}
              </Descriptions.Item>
              {selectedLicense.notes && (
                <Descriptions.Item label="Notes" span={2}>{selectedLicense.notes}</Descriptions.Item>
              )}
            </Descriptions>

            {selectedLicense.installations?.length > 0 && (
              <>
                <Title level={5} style={{ marginTop: 24, marginBottom: 12 }}>
                  <DesktopOutlined /> Installations ({selectedLicense.installations.length})
                </Title>
                <List
                  dataSource={selectedLicense.installations}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<DesktopOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                        title={
                          <Space>
                            <Text strong>{item.asset_tag}</Text>
                            <Text type="secondary">({item.asset_product_name})</Text>
                          </Space>
                        }
                        description={
                          <Space split="|">
                            {item.assigned_to_name && (
                              <span><UserOutlined /> {item.assigned_to_name}</span>
                            )}
                            {item.location_name && <span>{item.location_name}</span>}
                            <span>Installed: {dayjs(item.installed_at).format('DD/MM/YYYY')}</span>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </>
            )}

            {(!selectedLicense.installations || selectedLicense.installations.length === 0) && (
              <Alert
                message="No installations"
                description="This license has not been allocated to any assets yet."
                type="info"
                showIcon
                style={{ marginTop: 24 }}
              />
            )}
          </>
        )}
      </Drawer>

      {/* License Keys Modal */}
      <Modal
        title={
          <Space>
            <KeyOutlined />
            <span>Manage License Keys - {selectedLicense?.license_name}</span>
          </Space>
        }
        open={keysModalOpen}
        onCancel={() => {
          setKeysModalOpen(false)
          setLicenseKeys([])
          keysForm.resetFields()
        }}
        footer={null}
        width={700}
      >
        {selectedLicense && (
          <>
            {/* Summary */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small">
                  <Statistic title="Total Purchased" value={selectedLicense.total_licenses} valueStyle={{ color: '#1890ff' }} />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic title="Keys Added" value={licenseKeys.length} valueStyle={{ color: '#52c41a' }} />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="Keys Allocated"
                    value={licenseKeys.filter(k => k.is_allocated).length}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="Keys Available"
                    value={licenseKeys.filter(k => !k.is_allocated).length}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Missing Keys Alert */}
            {licenseKeys.length < selectedLicense.total_licenses && (
              <Alert
                message={`${selectedLicense.total_licenses - licenseKeys.length} license key(s) need to be added`}
                description="You have purchased more licenses than keys entered. Add the remaining license keys below."
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            {/* Add Keys Form */}
            <Card size="small" title="Add License Keys" style={{ marginBottom: 16 }}>
              <Form form={keysForm} layout="vertical">
                <Form.Item
                  name="license_keys"
                  label="License Keys"
                  rules={[{ required: true, message: 'Enter at least one license key' }]}
                  extra="Enter one key per line, or separate multiple keys with commas or semicolons"
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="XXXXX-XXXXX-XXXXX-XXXXX&#10;YYYYY-YYYYY-YYYYY-YYYYY&#10;..."
                  />
                </Form.Item>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddKeys}
                  loading={addingKeys}
                  disabled={licenseKeys.length >= selectedLicense.total_licenses}
                >
                  Add Keys
                </Button>
                {licenseKeys.length >= selectedLicense.total_licenses && (
                  <Text type="secondary" style={{ marginLeft: 12 }}>
                    All {selectedLicense.total_licenses} license keys have been added
                  </Text>
                )}
              </Form>
            </Card>

            {/* Keys List */}
            <Card size="small" title={`License Keys (${licenseKeys.length})`}>
              <Table
                dataSource={licenseKeys}
                rowKey="id"
                loading={keysLoading}
                size="small"
                pagination={{ pageSize: 10 }}
                columns={[
                  {
                    title: '#',
                    key: 'index',
                    width: 40,
                    render: (_, __, idx) => idx + 1
                  },
                  {
                    title: 'License Key',
                    dataIndex: 'license_key',
                    key: 'license_key',
                    render: (key) => <Text code copyable={{ text: key }}>{key}</Text>
                  },
                  {
                    title: 'Status',
                    dataIndex: 'is_allocated',
                    key: 'is_allocated',
                    width: 100,
                    render: (allocated) => (
                      <Tag color={allocated ? 'blue' : 'green'}>
                        {allocated ? 'Allocated' : 'Available'}
                      </Tag>
                    )
                  },
                  {
                    title: 'Allocated To',
                    key: 'allocated_to',
                    width: 150,
                    render: (_, record) => record.is_allocated ? (
                      <Space direction="vertical" size={0}>
                        <Text style={{ fontSize: 12 }}>{record.asset_tag}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>{record.assigned_to_name || '-'}</Text>
                      </Space>
                    ) : '-'
                  },
                  {
                    title: 'Actions',
                    key: 'actions',
                    width: 80,
                    render: (_, record) => (
                      <Popconfirm
                        title="Delete this license key?"
                        onConfirm={() => handleDeleteKey(record.id)}
                        disabled={record.is_allocated}
                      >
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          disabled={record.is_allocated}
                        />
                      </Popconfirm>
                    )
                  }
                ]}
              />
            </Card>
          </>
        )}
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal
        title={
          <Space>
            <UploadOutlined />
            <span>Bulk Upload Licenses</span>
          </Space>
        }
        open={bulkUploadModalOpen}
        onCancel={handleBulkUploadClose}
        footer={
          bulkUploadStep === 'upload' ? (
            <Button onClick={handleBulkUploadClose}>Cancel</Button>
          ) : bulkUploadStep === 'preview' ? (
            <Space>
              <Button onClick={() => setBulkUploadStep('upload')}>Back</Button>
              <Button type="primary" onClick={handleBulkUploadSubmit} loading={bulkUploading}>
                Upload {bulkUploadData.length} License(s)
              </Button>
            </Space>
          ) : (
            <Button type="primary" onClick={handleBulkUploadClose}>Done</Button>
          )
        }
        width={900}
      >
        {bulkUploadStep === 'upload' && (
          <>
            <Alert
              message="Excel Upload Instructions"
              description={
                <div>
                  <p>Upload an Excel file (.xlsx) containing license data. The file should have the following columns:</p>
                  <ul style={{ marginBottom: 0 }}>
                    <li><strong>Product Name</strong> (required): Name of existing software product</li>
                    <li><strong>License Name</strong> (required): License identifier/name</li>
                    <li><strong>License Type</strong> (required): per_user, per_device, concurrent, site, or volume</li>
                    <li><strong>Total Licenses</strong> (required): Number of licenses purchased</li>
                    <li><strong>License Key (Master)</strong> (for site/volume/concurrent): Single shared key</li>
                    <li><strong>License Keys</strong> (for per_user/per_device): Individual keys separated by semicolons (;)</li>
                    <li><strong>Vendor Name, Purchase Date, Expiration Date, Purchase Cost, Notes</strong> (optional)</li>
                  </ul>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <div style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<FileExcelOutlined />} onClick={downloadTemplate}>
                Download Excel Template
              </Button>
              <Text type="secondary" style={{ marginLeft: 12 }}>
                Download and fill in the template, then upload it below
              </Text>
            </div>

            <Dragger
              name="file"
              multiple={false}
              accept=".xlsx,.xls"
              beforeUpload={handleFileUpload}
              showUploadList={false}
            >
              <p className="ant-upload-drag-icon">
                <FileExcelOutlined style={{ color: '#52c41a', fontSize: 48 }} />
              </p>
              <p className="ant-upload-text">Click or drag Excel file to upload</p>
              <p className="ant-upload-hint">
                Supports .xlsx and .xls files. Download the template above for correct format.
              </p>
            </Dragger>
          </>
        )}

        {bulkUploadStep === 'preview' && (
          <>
            <Alert
              message={`${bulkUploadData.length} license(s) ready to upload`}
              description="Review the data below before uploading. Make sure product names match existing software products."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Table
              dataSource={bulkUploadData.map((item, idx) => ({ ...item, _key: idx }))}
              rowKey="_key"
              size="small"
              scroll={{ x: 800, y: 400 }}
              pagination={false}
              columns={[
                {
                  title: '#',
                  key: 'index',
                  width: 40,
                  render: (_, __, idx) => idx + 1
                },
                {
                  title: 'Product',
                  dataIndex: 'product_name',
                  key: 'product_name',
                  width: 150,
                  ellipsis: true
                },
                {
                  title: 'License Name',
                  dataIndex: 'license_name',
                  key: 'license_name',
                  width: 180,
                  ellipsis: true
                },
                {
                  title: 'Type',
                  dataIndex: 'license_type',
                  key: 'license_type',
                  width: 100,
                  render: (type) => (
                    <Tag color={licenseService.getLicenseTypeColor(type)}>
                      {licenseService.getLicenseTypeLabel(type) || type}
                    </Tag>
                  )
                },
                {
                  title: 'Qty',
                  dataIndex: 'total_licenses',
                  key: 'total_licenses',
                  width: 60,
                  align: 'center'
                },
                {
                  title: 'Keys',
                  key: 'keys',
                  width: 80,
                  render: (_, record) => {
                    const isMasterKey = ['site', 'volume', 'concurrent'].includes(record.license_type)
                    if (isMasterKey) {
                      return record.license_key ? (
                        <Tag color="blue">Master Key</Tag>
                      ) : (
                        <Tag color="red">Missing</Tag>
                      )
                    }
                    const keysCount = Array.isArray(record.license_keys) ? record.license_keys.length : 0
                    const required = record.total_licenses || 0
                    return keysCount === required ? (
                      <Tag color="green">{keysCount} / {required}</Tag>
                    ) : (
                      <Tag color="red">{keysCount} / {required}</Tag>
                    )
                  }
                },
                {
                  title: 'Vendor',
                  dataIndex: 'vendor_name',
                  key: 'vendor_name',
                  width: 100,
                  ellipsis: true,
                  render: (text) => text || '-'
                },
                {
                  title: 'Cost (₹)',
                  dataIndex: 'purchase_cost',
                  key: 'purchase_cost',
                  width: 100,
                  render: (cost) => cost ? `₹${cost.toLocaleString('en-IN')}` : '-'
                }
              ]}
            />
          </>
        )}

        {bulkUploadStep === 'result' && bulkUploadResult && (
          <>
            <Result
              status={bulkUploadResult.errors.length === 0 ? 'success' : bulkUploadResult.success.length > 0 ? 'warning' : 'error'}
              title={
                bulkUploadResult.errors.length === 0
                  ? 'All licenses uploaded successfully!'
                  : bulkUploadResult.success.length > 0
                    ? 'Partial upload completed'
                    : 'Upload failed'
              }
              subTitle={`${bulkUploadResult.success.length} created, ${bulkUploadResult.errors.length} failed`}
            />

            {bulkUploadResult.success.length > 0 && (
              <Card size="small" title={<><CheckCircleOutlined style={{ color: '#52c41a' }} /> Successfully Created ({bulkUploadResult.success.length})</>} style={{ marginBottom: 16 }}>
                <Table
                  dataSource={bulkUploadResult.success}
                  rowKey="license_id"
                  size="small"
                  pagination={false}
                  scroll={{ y: 150 }}
                  columns={[
                    { title: 'Row', dataIndex: 'row', width: 60 },
                    { title: 'License Name', dataIndex: 'license_name', ellipsis: true },
                    { title: 'Keys Added', dataIndex: 'keys_added', width: 100 }
                  ]}
                />
              </Card>
            )}

            {bulkUploadResult.errors.length > 0 && (
              <Card size="small" title={<><CloseCircleOutlined style={{ color: '#ff4d4f' }} /> Failed ({bulkUploadResult.errors.length})</>}>
                <Table
                  dataSource={bulkUploadResult.errors}
                  rowKey={(r) => `${r.row}-${r.error}`}
                  size="small"
                  pagination={false}
                  scroll={{ y: 150 }}
                  columns={[
                    { title: 'Row', dataIndex: 'row', width: 60 },
                    { title: 'License', render: (_, r) => r.data?.license_name || '-', width: 150, ellipsis: true },
                    { title: 'Error', dataIndex: 'error', ellipsis: true }
                  ]}
                />
              </Card>
            )}
          </>
        )}
      </Modal>
    </div>
  )
}

export default SoftwareLicenses
